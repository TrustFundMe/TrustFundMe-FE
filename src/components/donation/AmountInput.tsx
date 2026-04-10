type AmountInputProps = {
    amount: number;
    isManualMode: boolean;
    onPresetClick: (amount: number) => void;
    onAmountChange: (amount: number) => void;
    presets?: number[];
    compact?: boolean;
    showSuggestions?: boolean;
    onShowSuggestions?: () => void;
};

export default function AmountInput({
    amount,
    isManualMode,
    onPresetClick,
    onAmountChange,
    presets = [20000, 50000, 100000, 200000],
    compact = false,
    showSuggestions,
    onShowSuggestions,
}: AmountInputProps) {
    const formatNumber = (val: number) => {
        if (!val) return '';
        return val.toLocaleString('vi-VN');
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digit characters
        const rawValue = e.target.value.replace(/\D/g, '');
        const numericValue = Number(rawValue);
        onAmountChange(numericValue);
    };

    return (
        <div className={compact ? "space-y-2" : "space-y-3"}>
            <div className={`flex ${compact ? "gap-2" : "gap-2"}`}>
                {presets.map(val => (
                    <button
                        key={val}
                        onClick={() => onPresetClick(val)}
                        className={`flex-1 ${compact ? "py-2" : "py-2"} rounded-xl font-bold text-sm border transition-all ${(!isManualMode && amount === val)
                            ? 'border-[#dc2626] bg-[#dc2626] text-white shadow-md shadow-red-200'
                            : `${compact ? 'border-gray-200' : 'border-gray-100'} bg-white text-gray-400 hover:border-[#dc2626]/30`
                            }`}
                    >
                        {val.toLocaleString('vi-VN')}
                    </button>
                ))}
            </div>
            <div className="relative group">
                <span className={`absolute ${compact ? "left-5" : "left-6"} top-1/2 -translate-y-1/2 ${compact ? "text-xl" : "text-2xl"} font-black transition-colors ${amount > 0 ? 'text-[#dc2626]' : 'text-gray-300'}`}>₫</span>
                <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(amount)}
                    onChange={handleTextChange}
                    placeholder="0"
                    className={`w-full bg-${compact ? 'white' : 'gray-50/50'} border ${compact ? 'border-gray-200' : 'border-gray-100'} ${compact ? 'rounded-2xl' : 'rounded-2xl'} ${compact ? 'py-3' : 'py-2'} ${compact ? 'pl-10' : 'pl-12'} pr-4 ${compact ? 'text-3xl' : 'text-3xl'} font-black focus:outline-none focus:border-[#dc2626] ${compact ? 'focus:ring-2' : 'focus:bg-white'} focus:ring-red-50 transition-all placeholder:text-gray-200`}
                />
            </div>
            {onShowSuggestions && (
                <button
                    onClick={onShowSuggestions}
                    className="w-full py-2 rounded-xl text-xs font-bold border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 transition-all"
                >
                    Xem gợi ý tổ hợp vật phẩm
                </button>
            )}
        </div>
    );
}
