import React from 'react';
import { Clock, DollarSign, Loader2 } from 'lucide-react';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';

interface WithdrawalModalProps {
    show: boolean;
    campaign: { type: string; balance: number } | null;
    selectedExp: Expenditure | null;
    donationSummary: Record<number, number>;
    loadingDonationSummary: boolean;
    withdrawAmount: string;
    onWithdrawAmountChange: (val: string) => void;
    evidenceDate: string;
    onEvidenceDateChange: (val: string) => void;
    modalError: string | null;
    submittingWithdrawal: boolean;
    onSubmit: () => void;
    onClose: () => void;
}

export default function WithdrawalModal({
    show,
    campaign,
    selectedExp,
    donationSummary,
    loadingDonationSummary,
    withdrawAmount,
    onWithdrawAmountChange,
    evidenceDate,
    onEvidenceDateChange,
    modalError,
    submittingWithdrawal,
    onSubmit,
    onClose,
}: WithdrawalModalProps) {
    if (!show) return null;

    const isItemized = campaign?.type === 'ITEMIZED';
    const items: ExpenditureItem[] = selectedExp?.items ?? [];
    const hasItems = items.length > 0;

    // Số dư hiện tại của campaign
    const currentBalance = campaign?.balance != null ? Number(campaign.balance) : 0;

    // Tổng quyên góp kỳ này
    const currentReceived = items.reduce((sum, item) => {
        const donatedQty = donationSummary[item.id] ?? 0;
        return sum + donatedQty * (item.expectedPrice || 0);
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-10 max-h-[95vh] overflow-y-auto relative no-scrollbar">
                <h3 className="text-2xl font-black text-black text-center mb-1">Yêu cầu giải ngân</h3>
                <p className="text-sm text-gray-500 font-bold text-center mb-8">Vui lòng nhập số tiền muốn rút và hạn nộp minh chứng chi tiêu</p>

                {/* Thông tin tổng hợp cho ITEMIZED */}
                {isItemized && hasItems && (
                    <div className="mb-6">
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Số dư hiện tại</p>
                                <p className="text-xl font-black text-black">
                                    {new Intl.NumberFormat('vi-VN').format(currentBalance)} đ
                                </p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                                <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-1">Tổng giải ngân kỳ này</p>
                                <p className="text-xl font-black text-emerald-700">
                                    {loadingDonationSummary ? '...' : `${new Intl.NumberFormat('vi-VN').format(currentReceived)} đ`}
                                </p>
                            </div>
                        </div>

                        {/* Ô nhập số tiền rút */}
                        <div className="mb-6">
                            <label className="block text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">
                                SỐ TIỀN MUỐN RÚT
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={withdrawAmount}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/[.,\s]/g, '');
                                        if (!isNaN(Number(raw)) || raw === '') {
                                            onWithdrawAmountChange(raw ? Number(raw).toLocaleString('vi-VN') : '');
                                        }
                                    }}
                                    placeholder={`${new Intl.NumberFormat('vi-VN').format(currentReceived)} – ${new Intl.NumberFormat('vi-VN').format(currentBalance)} đ`}
                                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    đ
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 px-1">
                                Số tiền rút phải ≥ tổng quyên góp và ≤ số dư (
                                <span className="text-emerald-600">
                                    {new Intl.NumberFormat('vi-VN').format(currentReceived)} đ
                                </span>
                                {' – '}
                                <span className="text-gray-600">
                                    {new Intl.NumberFormat('vi-VN').format(currentBalance)} đ
                                </span>
                                )
                            </p>
                        </div>

                        {/* Bảng hạng mục quyên góp */}
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                <DollarSign className="w-3 h-3 text-slate-400" />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                DANH SÁCH HẠNG MỤC ({items.length})
                            </h4>
                        </div>

                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-white mb-6">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="text-left px-5 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Tên hàng hóa</th>
                                        <th className="px-3 py-4 font-black text-blue-500/80 uppercase text-[9px] tracking-widest text-center">Kế hoạch</th>
                                        <th className="px-3 py-4 font-black text-emerald-500/80 uppercase text-[9px] tracking-widest text-center">Tổng giải ngân</th>
                                        <th className="px-3 py-4 font-black text-orange-500/80 uppercase text-[9px] tracking-widest text-center w-[10%]">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        let totalPlanMoney = 0;
                                        let totalDonatedMoney = 0;
                                        let totalPlanQty = 0;
                                        let totalDonatedQty = 0;

                                        // Tổng giải ngân - tổng quyên góp (phần thêm từ số dư chiến dịch)
                                        const totalDisbursementExtra = currentBalance - currentReceived;

                                        return (
                                            <>
                                                {items.map(item => {
                                                    const donatedQty = donationSummary[item.id] ?? 0;
                                                    const unitPrice = item.expectedPrice || 0;
                                                    const planSubtotal = (item.expectedQuantity || 0) * unitPrice;
                                                    const donatedSubtotal = donatedQty * unitPrice;
                                                    const percentage = (item.expectedQuantity || 0) > 0 ? Math.min(100, (donatedQty / (item.expectedQuantity || 0)) * 100) : 0;

                                                    totalPlanMoney += planSubtotal;
                                                    totalDonatedMoney += donatedSubtotal;
                                                    totalPlanQty += (item.expectedQuantity || 0);
                                                    totalDonatedQty += donatedQty;

                                                    return (
                                                        <tr key={item.id} className="border-b border-slate-50 last:border-0 group">
                                                            <td className="px-5 py-4 align-middle">
                                                                <div className="font-black text-slate-700 text-[11px] leading-tight break-words max-w-[120px]">{item.name}</div>
                                                            </td>
                                                            <td className="px-3 py-4 text-center align-middle">
                                                                <div className="text-[11px] font-black text-blue-600 leading-none mb-1">
                                                                    {new Intl.NumberFormat('vi-VN').format(planSubtotal)} <span className="text-[8px] opacity-60">đ</span>
                                                                </div>
                                                                <div className="text-[9px] font-bold text-blue-300">
                                                                    {item.expectedQuantity} × {new Intl.NumberFormat('vi-VN').format(unitPrice)} <span className="text-[7px] opacity-40 italic">đ</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4 text-center align-middle bg-emerald-50/10">
                                                                <div className={`text-[11px] font-black leading-none mb-1 ${donatedQty > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                                    {new Intl.NumberFormat('vi-VN').format(donatedSubtotal)} <span className="text-[8px] opacity-60">đ</span>
                                                                </div>
                                                                <div className={`text-[9px] font-bold ${donatedQty > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                                    {donatedQty} × {new Intl.NumberFormat('vi-VN').format(unitPrice)} <span className="text-[7px] opacity-40 italic">đ</span>
                                                                    {!loadingDonationSummary && donatedQty === 0 && <span className="block text-[7px] opacity-50 italic font-medium">(Chưa có dữ liệu)</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4 text-center align-middle">
                                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[9px] font-black border-2 ${percentage >= 100 ? 'bg-emerald-500 border-emerald-400 text-white' : percentage > 0 ? 'bg-white border-slate-100 text-slate-400' : 'bg-slate-50 border-transparent text-slate-300'}`}>
                                                                    {loadingDonationSummary ? '...' : `${Math.round(percentage)}%`}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-slate-50/20 border-t-2 border-slate-100">
                                                    <td className="px-5 py-4 font-black text-slate-800 text-[11px] uppercase tracking-wide italic">Tổng cộng</td>
                                                    <td className="px-3 py-4 text-center">
                                                        <div className="text-sm font-black text-blue-700 leading-tight">
                                                            {new Intl.NumberFormat('vi-VN').format(totalPlanMoney)} đ
                                                        </div>
                                                        <div className="text-[9px] font-bold text-blue-400 whitespace-nowrap">
                                                            {totalPlanQty} vật phẩm
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-center bg-emerald-50/30">
                                                        {/* Tổng quyên góp */}
                                                        <div className="text-[10px] font-bold text-emerald-700 mb-1">Tổng quyên góp</div>

                                                        {/* Chi tiết từng vật phẩm */}
                                                        {(() => {
                                                            let runningTotal = 0;
                                                            return (
                                                                <>
                                                                    {items.map(item => {
                                                                        const donatedQty = donationSummary[item.id] ?? 0;
                                                                        const unitPrice = item.expectedPrice || 0;
                                                                        const sub = donatedQty * unitPrice;
                                                                        runningTotal += sub;
                                                                        return (
                                                                            <div key={item.id} className="text-[8px] text-emerald-500/70">
                                                                                {donatedQty}×{new Intl.NumberFormat('vi-VN').format(unitPrice)} = {new Intl.NumberFormat('vi-VN').format(sub)} đ
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    {/* Phần rút thêm từ số dư */}
                                                                    {totalDisbursementExtra > 0 && (
                                                                        <div className="text-[8px] text-slate-400 mt-0.5">
                                                                            + {new Intl.NumberFormat('vi-VN').format(totalDisbursementExtra)} đ (số dư)
                                                                        </div>
                                                                    )}
                                                                    {/* Tổng giải ngân */}
                                                                    <div className="mt-1 pt-1 border-t border-emerald-200">
                                                                        <div className="text-[11px] font-black text-emerald-800">
                                                                            = {new Intl.NumberFormat('vi-VN').format(currentBalance)} đ
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-3 py-4 text-center">
                                                        <div className="text-[10px] font-black text-slate-400">
                                                            {totalPlanQty > 0 ? Math.round((totalDonatedQty / totalPlanQty) * 100) : 0}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            </>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>

                        {/* Thông báo sắp rút */}
                        <div className="mb-8 p-6 bg-yellow-50/50 border border-yellow-100 rounded-3xl">
                            <p className="text-[11px] font-bold text-yellow-800 text-center leading-relaxed">
                                Bạn sắp rút <strong className="text-orange-600 font-black">{withdrawAmount ? `${withdrawAmount} đ` : '...'}</strong> cho đợt chi tiêu này. Tại thời điểm này, hệ thống sẽ <span className="text-orange-700 font-black underline underline-offset-2">dừng nhận donation</span> để tiến hành giải ngân.
                            </p>
                        </div>
                    </div>
                )}

                {/* Nút chọn hạn nộp minh chứng */}
                <div className="mb-10 px-1">
                    <label className="block text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">HẠN NỘP MINH CHỨNG</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={evidenceDate}
                            onChange={(e) => onEvidenceDateChange(e.target.value)}
                            className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all appearance-none"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Clock className="w-4 h-4 text-slate-300" />
                        </div>
                    </div>
                </div>

                {modalError && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-rose-500 uppercase">{modalError}</p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <button
                        onClick={onSubmit}
                        disabled={submittingWithdrawal}
                        className="w-full py-4 bg-[#e11d48] text-white text-[11px] font-black uppercase tracking-[2px] rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {submittingWithdrawal && <Loader2 className="w-4 h-4 animate-spin" />}
                        XÁC NHẬN
                    </button>
                    <button
                        onClick={onClose}
                        disabled={submittingWithdrawal}
                        className="w-full py-2 text-[10px] font-black uppercase tracking-[2px] text-slate-300 hover:text-slate-500 transition-colors disabled:opacity-50"
                    >
                        HỦY BỎ
                    </button>
                </div>
            </div>
        </div>
    );
}