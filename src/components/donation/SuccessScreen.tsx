type SuccessScreenProps = {
    totalAmount: number;
    onReset: () => void;
};

export default function SuccessScreen({ totalAmount, onReset }: SuccessScreenProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fff8f3] p-4 font-sans" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-10 max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#ff5e14]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-900">Thanh toán thành công!</h2>
                <p className="text-gray-500 text-sm mb-8">Cảm ơn bạn đã đóng góp {totalAmount.toLocaleString('vi-VN')}₫</p>
                <button
                    onClick={onReset}
                    className="w-full py-3 bg-[#ff5e14] hover:bg-[#ea550c] text-white rounded-xl font-bold text-sm transition-colors active:scale-[0.98]"
                >
                    Đóng góp thêm
                </button>
            </div>
        </div>
    );
}
