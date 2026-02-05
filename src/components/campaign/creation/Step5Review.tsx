'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Step5ReviewProps {
    data: any;
    onSubmit: () => void;
    isSubmitting: boolean;
    result: any;
}

export default function Step5Review({ data, onSubmit, isSubmitting, result }: Step5ReviewProps) {
    const isAuthorized = data.fundType === 'AUTHORIZED';
    const totalAmount = data.expenditureItems?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;

    return (
        <div className="space-y-6">
            <div>
                <div className="text-sm font-semibold text-black">Kiểm tra & Cam kết</div>
                <div className="mt-1 text-xs text-black/60">Xem lại toàn bộ thông tin trước khi gửi duyệt.</div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-black/30">Chiến dịch</div>
                    <div className="mt-1 text-sm font-bold text-black">{data.title || 'Chưa đặt tiêu đề'}</div>
                    <div className="mt-1 text-xs text-black/50 line-clamp-2">{data.description}</div>
                </div>

                <div className="rounded-2xl bg-black/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-black/30">Loại Quỹ & Mục tiêu</div>
                    <div className="mt-1 text-sm font-bold text-[#dc2626]">
                        {isAuthorized ? 'Quỹ Ủy Quyền' : 'Quỹ Mục Tiêu'}
                    </div>
                    <div className="mt-1 text-xs font-black text-black">
                        {isAuthorized ? 'Theo hạn mức chi' : `${totalAmount.toLocaleString()}đ`}
                    </div>
                </div>

                <div className="rounded-2xl bg-black/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-black/30">Tài khoản nhận</div>
                    <div className="mt-1 text-sm font-bold text-black">{data.bankAccount?.bankName || 'Chưa chọn'}</div>
                    <div className="mt-1 text-xs text-black/50">{data.bankAccount?.accountNumber}</div>
                </div>

                <div className="rounded-2xl bg-black/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-black/30">Thời gian</div>
                    <div className="mt-1 text-sm font-bold text-black">
                        {data.startDate} → {data.endDate}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-2xl border-2 border-[#dc2626]/20 bg-[#dc2626]/5">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 rounded border-black/20 text-[#dc2626] focus:ring-[#dc2626]" required />
                    <div className="text-xs leading-relaxed text-black/60">
                        Tôi cam kết các thông tin cung cấp là hoàn toàn chính xác và sẽ chịu trách nhiệm trước pháp luật về việc sử dụng quỹ minh bạch theo đúng kế hoạch đã đề ra.
                    </div>
                </label>
            </div>

            <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#dc2626] py-4 text-sm font-bold text-white shadow-xl shadow-red-100 transition-all hover:bg-red-700 disabled:opacity-50"
            >
                {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <CheckCircle2 className="h-5 w-5" />
                )}
                {isSubmitting ? 'Đang gửi duyệt...' : 'Gửi duyệt chiến dịch'}
            </button>

            {result.type === 'error' && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-600">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div className="text-xs font-semibold">{result.message}</div>
                </div>
            )}
        </div>
    );
}