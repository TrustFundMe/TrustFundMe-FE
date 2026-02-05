import { QrCode, Wallet, Banknote } from 'lucide-react';
import { PaymentMethod } from './types';

type PaymentMethodsProps = {
    selected: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
    compact?: boolean;
};

const paymentOptions = [
    { id: 'payos' as PaymentMethod, label: 'Thẻ ATM / PayOS', icon: QrCode },
    { id: 'paypal' as PaymentMethod, label: 'PayPal', icon: Wallet },
    { id: 'cash' as PaymentMethod, label: 'Tiền mặt', icon: Banknote },
];

export default function PaymentMethods({ selected, onChange, compact = false }: PaymentMethodsProps) {
    return (
        <div className={compact ? "mb-3" : "mb-4"}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Thanh toán</h3>
            <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
                {paymentOptions.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => onChange(m.id)}
                        className={`relative flex items-center justify-between ${compact ? "p-3 px-4" : "p-3 px-4"} rounded-xl border cursor-pointer transition-all ${selected === m.id
                            ? 'bg-white border-[#dc2626] shadow-sm z-10'
                            : 'bg-transparent border-gray-200 hover:bg-white hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <m.icon className={`w-5 h-5 ${selected === m.id ? 'text-[#dc2626]' : 'text-gray-400'}`} />
                            <span className={`text-xs font-bold ${selected === m.id ? 'text-gray-900' : 'text-gray-500'}`}>{m.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === m.id ? 'border-[#dc2626]' : 'border-gray-300'}`}>
                            {selected === m.id && <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
