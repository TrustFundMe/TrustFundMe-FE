import { CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from './types';
import AmountInput from './AmountInput';
import PaymentSummary from './PaymentSummary';
import PaymentMethods from './PaymentMethods';

type DonationGeneralLayoutProps = {
    amount: number;
    isManualMode: boolean;
    tipPercent: number;
    paymentMethod: PaymentMethod;
    isAnonymous: boolean;
    isAgreed: boolean;
    submitting: boolean;
    onPresetClick: (amount: number) => void;
    onAmountChange: (amount: number) => void;
    onTipChange: (percent: number) => void;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    onAnonymousChange: (checked: boolean) => void;
    onAgreedChange: (checked: boolean) => void;
    onShowTerms: () => void;
    onSubmit: () => void;
};

export default function DonationGeneralLayout({
    amount,
    isManualMode,
    tipPercent,
    paymentMethod,
    isAnonymous,
    isAgreed,
    submitting,
    onPresetClick,
    onAmountChange,
    onTipChange,
    onPaymentMethodChange,
    onAnonymousChange,
    onAgreedChange,
    onShowTerms,
    onSubmit
}: DonationGeneralLayoutProps) {
    const tipAmount = Math.round((amount * tipPercent) / 100);
    const totalAmount = amount + tipAmount;

    return (
        <div className="w-full max-w-[540px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col overflow-hidden">
            {/* TOP SECTION: CONFIGURATION */}
            <div className="p-6 pb-2 flex flex-col gap-2 bg-white items-center text-center">
                {/* Header */}
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <div className="w-5 h-1.5 bg-[#dc2626] rounded-full"></div>
                        <span className="text-xs font-black uppercase tracking-[3px] text-gray-400">TrustFundMe Donation</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-gray-900">Trao gửi yêu thương - Quỹ Chung</h1>
                </div>

                {/* Amount Input */}
                <div className="w-full">
                    <AmountInput
                        amount={amount}
                        isManualMode={isManualMode}
                        onPresetClick={onPresetClick}
                        onAmountChange={onAmountChange}
                    />
                </div>
            </div>

            {/* BOTTOM SECTION: CHECKOUT */}
            <div className="bg-gray-50/50 p-6 pt-3 flex flex-col gap-3 border-t border-gray-50">
                <PaymentSummary
                    amount={amount}
                    tipPercent={tipPercent}
                    onTipChange={onTipChange}
                    compact={true}
                />

                <PaymentMethods
                    selected={paymentMethod}
                    onChange={onPaymentMethodChange}
                    compact={true}
                />

                {/* Extra Options */}
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isAnonymous ? 'bg-[#dc2626] border-[#dc2626]' : 'border-gray-300 bg-white'}`}>
                            {isAnonymous && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={isAnonymous} onChange={e => onAnonymousChange(e.target.checked)} />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Quyên góp ẩn danh</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isAgreed ? 'bg-[#dc2626] border-[#dc2626]' : 'border-gray-300 bg-white'}`}>
                            {isAgreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={isAgreed} onChange={e => onAgreedChange(e.target.checked)} />
                        <span className="text-sm font-medium text-gray-600">
                            Tôi đồng ý với <span onClick={(e) => { e.preventDefault(); onShowTerms(); }} className="text-[#dc2626] underline hover:text-red-700">điều khoản & cam kết</span>
                        </span>
                    </label>
                </div>

                {/* Pay Button */}
                <button
                    disabled={submitting || totalAmount === 0 || !isAgreed}
                    onClick={onSubmit}
                    className="w-full bg-black text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? 'Đang xử lý...' : 'Thanh toán ngay'}
                </button>
            </div>
        </div>
    );
}
