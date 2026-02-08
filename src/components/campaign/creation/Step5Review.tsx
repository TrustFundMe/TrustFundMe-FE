'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Video, FileText, Star } from 'lucide-react';

interface Step5ReviewProps {
    data: any;
    onSubmit: () => void;
    isSubmitting: boolean;
    result: any;
}

export default function Step5Review({ data, onSubmit, isSubmitting, result }: Step5ReviewProps) {
    const [showModal, setShowModal] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);
    const isAuthorized = data.fundType === 'AUTHORIZED';
    const totalAmount = data.expenditureItems?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Information */}
                <div className="lg:col-span-7 space-y-10">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-[#dc2626] uppercase tracking-[3px]">Thông tin chiến dịch</div>
                        <h2 className="text-3xl font-black text-black leading-tight tracking-tight">
                            {data.title || 'Chưa đặt tiêu đề'}
                        </h2>
                        <div className="text-sm font-medium text-black/60 leading-relaxed whitespace-pre-wrap">
                            {data.description || 'Chưa có mô tả chi tiết.'}
                        </div>
                    </div>

                    {/* Financial & Banking Grid */}
                    <div className="grid grid-cols-2 gap-10 pt-6 border-t border-black/5">
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-black/30 uppercase tracking-widest">Loại Quỹ & Mục tiêu</div>
                            <div className="text-sm font-black text-black">
                                {isAuthorized ? 'Quỹ Ủy Quyền' : 'Quỹ Tự Lập'}
                            </div>
                            <div className="text-xl font-black text-[#dc2626]">
                                {isAuthorized ? 'Standard' : `${totalAmount.toLocaleString('vi-VN')} VNĐ`}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-black/30 uppercase tracking-widest">Tài khoản thụ hưởng</div>
                            <div className="text-sm font-black text-black">
                                {data.bankAccount?.bankCode || 'Chưa chọn ngân hàng'}
                            </div>
                            <div className="text-base font-black text-black/40 tracking-widest">
                                {data.bankAccount?.accountNumber || 'Số tài khoản trống'}
                            </div>
                            <div className="text-[10px] font-black text-black/20 uppercase">
                                {data.bankAccount?.accountHolderName}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Media Gallery */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="text-[10px] font-black text-black/30 uppercase tracking-[3px]">Minh chứng & Hình ảnh ({data.attachments?.length || 0})</div>

                    <div className="grid grid-cols-2 gap-4">
                        {data.attachments?.map((item: any, idx: number) => {
                            const isCover = data.coverImage === item.url;
                            return (
                                <div
                                    key={idx}
                                    className={`relative aspect-square rounded-3xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${isCover ? 'border-[#dc2626] shadow-xl shadow-red-50' : 'border-gray-50'
                                        }`}
                                >
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                                    ) : item.type === 'video' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                            <Video className="h-6 w-6 text-white/50" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                            <FileText className="h-6 w-6 text-black/20" />
                                        </div>
                                    )}

                                    {isCover && (
                                        <div className="absolute top-3 right-3 bg-[#dc2626] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg">
                                            <Star className="h-2 w-2 fill-current" />
                                            Ảnh bìa
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {(!data.attachments || data.attachments.length === 0) && (
                            <div className="col-span-full aspect-[4/3] rounded-[2.5rem] bg-gray-50 flex flex-col items-center justify-center text-black/20 opacity-40 italic">
                                <AlertCircle className="h-8 w-8 mb-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Chưa có phương tiện</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-10 border-t border-black/5 space-y-6">
                <div className="p-6 rounded-[2rem] bg-[#dc2626]/5 border border-[#dc2626]/10 transition-all hover:bg-[#dc2626]/10">
                    <label className="flex items-start gap-4 cursor-pointer">
                        <div className="shrink-0 mt-1">
                            <input
                                type="checkbox"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="h-4 w-4 rounded-full border-2 border-[#dc2626]/20 text-[#dc2626] focus:ring-[#dc2626] cursor-pointer"
                                required
                            />
                        </div>
                        <div className="text-[11px] font-bold leading-relaxed text-red-900/80">
                            Tôi xác nhận đã đọc và đồng ý với các nội dung trong
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="mx-1 text-[#dc2626] underline hover:text-red-700 transition-colors uppercase tracking-tight"
                            >
                                Bản cam kết trách nhiệm
                            </button>
                            đối với người tạo quỹ. Tôi sẽ chịu hoàn toàn trách nhiệm trước pháp luật về tính minh bạch của chiến dịch.
                        </div>
                    </label>
                </div>

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting || !isAgreed}
                        className="w-full flex items-center justify-center gap-3 rounded-[2rem] bg-[#dc2626] py-2.5 text-sm font-black text-white shadow-2xl shadow-red-200 transition-all hover:bg-red-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 disabled:grayscale-[0.5]"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5" />
                        )}
                        <span className="uppercase tracking-[2px]">
                            {isSubmitting ? 'Đang khởi tạo hệ thống...' : 'Hoàn tất & Gửi duyệt chiến dịch'}
                        </span>
                    </button>

                    {result.type === 'error' && (
                        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-[#dc2626] animate-shake">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <div className="text-xs font-black uppercase tracking-tight">{result.message}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Commitment Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 sm:p-12 space-y-8 overflow-y-auto max-h-[85vh] custom-scrollbar">
                            <div className="text-center space-y-2">
                                <div className="text-[10px] font-black text-[#dc2626] uppercase tracking-[4px]">Văn bản pháp lý</div>
                                <h3 className="text-2xl font-black text-black tracking-tight">Bản Cam Kết Trách Nhiệm</h3>
                            </div>

                            <div className="space-y-6 text-sm font-medium text-black/70 leading-relaxed">
                                <section className="space-y-3">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-black uppercase tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#dc2626]"></div>
                                        1. Tính xác thực của thông tin
                                    </h4>
                                    <p className="pl-4 border-l-2 border-red-50">
                                        Tôi cam đoan mọi thông tin về hoàn cảnh, hồ sơ bệnh án, chứng từ và hình ảnh minh chứng được cung cấp trong chiến dịch là hoàn toàn có thật. Tôi hiểu rằng việc làm giả hồ sơ là vi phạm pháp luật và sẽ bị truy cứu trách nhiệm hình sự.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-black uppercase tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#dc2626]"></div>
                                        2. Minh bạch tài chính
                                    </h4>
                                    <p className="pl-4 border-l-2 border-red-50">
                                        Tôi cam kết sử dụng toàn bộ số tiền quyên góp được (sau khi trừ các chi phí vận hành nền tảng nếu có) đúng với mục đích đã công bố. Mọi khoản chi tiêu phát sinh phải có hóa đơn, chứng từ hợp lệ và được cập nhật công khai trên trang chiến dịch.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-black uppercase tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#dc2626]"></div>
                                        3. Trách nhiệm cập nhật
                                    </h4>
                                    <p className="pl-4 border-l-2 border-red-50">
                                        Tôi có trách nhiệm cập nhật tình hình thực tế và tiến độ sử dụng quỹ ít nhất 1 lần/tuần cho đến khi chiến dịch kết thúc hoặc quỹ được giải ngân hoàn toàn. Tôi sẽ phản hồi mọi thắc mắc của nhà hảo tâm trong vòng 48 giờ.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-black uppercase tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#dc2626]"></div>
                                        4. Cam kết pháp lý
                                    </h4>
                                    <p className="pl-4 border-l-2 border-red-50">
                                        Nếu có bất kỳ dấu hiệu gian lận hoặc sử dụng sai mục đích, tôi đồng ý để TrustFundMe đóng băng tài khoản và chuyển giao hồ sơ cho cơ quan chức năng. Tôi cũng cam kết bồi hoàn 100% số tiền nếu vi phạm các điều khoản này.
                                    </p>
                                </section>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-full py-4 rounded-2xl bg-black text-white text-xs font-black uppercase tracking-[2px] transition-all hover:bg-zinc-800 active:scale-[0.98]"
                            >
                                Tôi đã hiểu và đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #e5e5e5;
                }
            `}</style>
        </div>
    );
}