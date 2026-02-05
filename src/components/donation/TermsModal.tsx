type TermsModalProps = {
    onClose: () => void;
};

export default function TermsModal({ onClose }: TermsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✕</button>
                <h3 className="text-xl font-black mb-4">Cam kết quyên góp</h3>
                <div className="prose prose-sm text-gray-500 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <p>1. Số tiền quyên góp sẽ được sử dụng 100% cho mục đích từ thiện.</p>
                    <p>2. Chúng tôi cam kết minh bạch tài chính và báo cáo đầy đủ.</p>
                    <p>3. Trong trường hợp chiến dịch bị hủy, số tiền sẽ được hoàn trả hoặc chuyển sang quỹ chung.</p>
                    <p>4. Bằng việc quyên góp, bạn đồng ý với các điều khoản sử dụng và chính sách bảo mật của TrustFundMe.</p>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-3 bg-[#dc2626] text-white rounded-xl font-bold">Tôi đã hiểu</button>
            </div>
        </div>
    );
}
