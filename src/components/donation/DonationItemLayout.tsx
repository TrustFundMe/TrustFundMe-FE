import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExpenditureItem, PaymentMethod } from './types';
import { CampaignDto } from '@/types/campaign';
import AmountInput from './AmountInput';
import ItemList from './ItemList';
import PaymentSummary from './PaymentSummary';
import PaymentMethods from './PaymentMethods';

type DonationItemLayoutProps = {
    campaign: CampaignDto | null;
    amount: number;
    donationBlocked?: boolean;
    blockedMessage?: string;
    isManualMode: boolean;
    items: Record<string, number>;
    uiQuantities: Record<string, number>;
    visibleItems: ExpenditureItem[];
    page: number;
    itemsPerPage: number;
    tipPercent: number;
    paymentMethod: PaymentMethod;
    isAnonymous: boolean;
    isAgreed: boolean;
    submitting: boolean;

    onPresetClick: (amount: number) => void;
    onAmountChange: (amount: number) => void;
    onShowSuggestions: () => void;
    onItemSelect: (itemId: string, qty: number) => void;
    onQuantityChange: (itemId: string, diff: number) => void;
    onItemDeselect: (itemId: string) => void;
    onPageChange: (page: number) => void;
    onTipChange: (percent: number) => void;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    onAnonymousChange: (checked: boolean) => void;
    onAgreedChange: (checked: boolean) => void;
    onShowTerms: () => void;
    onSubmit: () => void;
    isGuest?: boolean;
};

export default function DonationItemLayout({
    campaign,
    amount,
    donationBlocked = false,
    blockedMessage = '',
    isManualMode,
    items,
    uiQuantities,
    visibleItems,
    page,
    itemsPerPage,
    tipPercent,
    paymentMethod,
    isAnonymous,
    isAgreed,
    submitting,

    onPresetClick,
    onAmountChange,
    onShowSuggestions,
    onItemSelect,
    onQuantityChange,
    onItemDeselect,
    onPageChange,
    onTipChange,
    onPaymentMethodChange,
    onAnonymousChange,
    onAgreedChange,
    onShowTerms,
    onSubmit,
    isGuest = false
}: DonationItemLayoutProps) {
    const router = useRouter();
    const tipAmount = Math.round((amount * tipPercent) / 100);
    const totalAmount = amount + tipAmount;

    if (donationBlocked) {
        return (
            <div className="w-full max-w-[1100px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="text-5xl mb-4">⏳</div>
                    <h3 className="text-xl font-black text-gray-700 mb-2">Tạm ngưng quyên góp</h3>
                    <p className="text-gray-400 font-medium">{blockedMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1100px] h-[750px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex overflow-hidden">
            {/* LEFT COLUMN: CONFIGURATION (65%) */}
            <div className="flex-[0.65] p-6 flex flex-col gap-3 border-r border-gray-50 bg-white">
                {/* Header */}
                <div className="flex items-start gap-4">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="mt-1 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-1.5 bg-[#dc2626] rounded-full"></div>
                            <span className="text-xs font-black uppercase tracking-[3px] text-gray-400">
                                {campaign?.type?.toUpperCase() === 'ITEMIZED' ? 'Quỹ vật phẩm' : 'Quỹ ủy quyền'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">{campaign?.title || 'Đang tải...'}</h1>
                    </div>
                </div>

                {/* Amount Input */}
                <AmountInput
                    amount={amount}
                    isManualMode={isManualMode}
                    onPresetClick={onPresetClick}
                    onAmountChange={onAmountChange}
                    onShowSuggestions={onShowSuggestions}
                    compact={true}
                />

                {/* Item List */}
                <ItemList
                    visibleItems={visibleItems}
                    selectedItems={items}
                    uiQuantities={uiQuantities}
                    page={page}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemSelect={onItemSelect}
                    onQuantityChange={onQuantityChange}
                    onItemDeselect={onItemDeselect}
                    amount={amount}
                />
            </div>

            {/* RIGHT COLUMN: CHECKOUT (35%) */}
            <div className="flex-[0.35] bg-gray-50/50 p-6 flex flex-col min-w-[320px] border-l border-gray-100">
                <PaymentSummary
                    amount={amount}
                    tipPercent={tipPercent}
                    onTipChange={onTipChange}
                />

                <PaymentMethods
                    selected={paymentMethod}
                    onChange={onPaymentMethodChange}
                />

                {/* Checkboxes */}
                <div className="mb-6 space-y-3">
                    {!isGuest && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isAnonymous ? 'bg-[#dc2626] border-[#dc2626]' : 'border-gray-300 bg-white'}`}>
                                {isAnonymous && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isAnonymous} onChange={e => onAnonymousChange(e.target.checked)} />
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Quyên góp ẩn danh</span>
                        </label>
                    )}

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
                    className="w-full bg-gray-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl shadow-gray-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Thanh toán ngay
                </button>
            </div>
        </div>
    );
}
