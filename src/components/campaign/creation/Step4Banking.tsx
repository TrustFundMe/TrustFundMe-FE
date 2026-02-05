'use client';

import { Building2, User, Hash, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface Step4BankingProps {
    data: any;
    onChange: (key: any, value: any) => void;
}

export default function Step4Banking({ data, onChange }: Step4BankingProps) {
    // Logic: Nếu tất cả các trường đều rỗng thì cho phép nhập (isEditing = true)
    // Nếu đã có dữ liệu (có thể từ props hoặc từ database đổ lên) thì khóa lại
    const hasData = data.bankAccount?.bank_code && data.bankAccount?.account_number && data.bankAccount?.account_holder_name;
    const isEditing = !hasData;

    const bankAccount = data.bankAccount || {
        bank_code: '',
        account_number: '',
        account_holder_name: '',
    };

    const updateBank = (field: string, value: string) => {
        if (!isEditing) return;
        onChange('bankAccount', { ...bankAccount, [field]: value });
    };

    return (
        <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-black tracking-tight">Thông tin nhận quỹ</h3>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest">
                    {isEditing ? 'Vui lòng cung cấp tài khoản ngân hàng chính chủ' : 'Tài khoản ngân hàng đã được liên kết'}
                </p>
            </div>

            <div className={`relative bg-white rounded-[2.5rem] p-8 border ${!isEditing ? 'border-[#dc2626]/20 shadow-[0_10px_30px_-10px_rgba(220,38,38,0.1)]' : 'border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]'}`}>
                {!isEditing && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-red-200 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        Tài khoản đã xác thực
                    </div>
                )}

                <div className="space-y-6">
                    {/* Ngân hàng */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">Ngân hàng thụ hưởng</label>
                        <div className={`group flex items-center gap-4 px-6 h-14 rounded-2xl border-2 transition-all ${!isEditing ? 'bg-gray-50/80 border-transparent shadow-inner' : 'bg-white border-black/5 focus-within:border-[#dc2626]/20 focus-within:shadow-xl focus-within:shadow-red-50'}`}>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${!isEditing ? 'bg-white text-[#dc2626]' : 'bg-gray-50 text-black/20 group-focus-within:bg-red-50 group-focus-within:text-[#dc2626]'}`}>
                                <Building2 className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={bankAccount.bank_code}
                                onChange={(e) => updateBank('bank_code', e.target.value)}
                                disabled={!isEditing}
                                placeholder="Ví dụ: Vietcombank, Techcombank..."
                                className="flex-1 bg-transparent border-none p-0 text-sm font-black text-black placeholder:text-black/10 focus:ring-0 disabled:text-black/60"
                            />
                        </div>
                    </div>

                    {/* Số tài khoản */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">Số tài khoản</label>
                        <div className={`group flex items-center gap-4 px-6 h-14 rounded-2xl border-2 transition-all ${!isEditing ? 'bg-gray-50/80 border-transparent shadow-inner' : 'bg-white border-black/5 focus-within:border-[#dc2626]/20 focus-within:shadow-xl focus-within:shadow-red-50'}`}>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${!isEditing ? 'bg-white text-[#dc2626]' : 'bg-gray-50 text-black/20 group-focus-within:bg-red-50 group-focus-within:text-[#dc2626]'}`}>
                                <Hash className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={bankAccount.account_number}
                                onChange={(e) => updateBank('account_number', e.target.value)}
                                disabled={!isEditing}
                                placeholder="Nhập số tài khoản của bạn"
                                className="flex-1 bg-transparent border-none p-0 text-sm font-black tracking-widest text-black placeholder:text-black/10 focus:ring-0 disabled:text-black/60"
                            />
                        </div>
                    </div>

                    {/* Tên chủ tài khoản */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">Tên chủ tài khoản</label>
                        <div className={`group flex items-center gap-4 px-6 h-14 rounded-2xl border-2 transition-all ${!isEditing ? 'bg-gray-50/80 border-transparent shadow-inner' : 'bg-white border-black/5 focus-within:border-[#dc2626]/20 focus-within:shadow-xl focus-within:shadow-red-50'}`}>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${!isEditing ? 'bg-white text-[#dc2626]' : 'bg-gray-50 text-black/20 group-focus-within:bg-red-50 group-focus-within:text-[#dc2626]'}`}>
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={bankAccount.account_holder_name}
                                onChange={(e) => updateBank('account_holder_name', e.target.value.toUpperCase())}
                                disabled={!isEditing}
                                placeholder="VIET HOA KHONG DAU"
                                className="flex-1 bg-transparent border-none p-0 text-sm font-black uppercase text-black placeholder:text-black/10 focus:ring-0 disabled:text-black/60"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <div className="flex items-start gap-3 p-6 rounded-3xl bg-red-50/50 border border-red-100">
                    <AlertCircle className="h-5 w-5 text-[#dc2626] shrink-0" />
                    <p className="text-[11px] font-bold text-red-800 leading-relaxed italic">
                        Lưu ý: Bạn đang cung cấp tài khoản mới. Vui lòng đảm bảo thông tin khớp với hồ sơ cá nhân để được duyệt nhanh hơn.
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-6 rounded-3xl bg-red-50/50 border border-red-100">
                    <ShieldCheck className="h-5 w-5 text-[#dc2626] shrink-0" />
                    <p className="text-[11px] font-bold text-red-800 leading-relaxed">
                        Hệ thống đã sử dụng tài khoản ngân hàng chính chủ của bạn. Thông tin này được giữ nguyên để đảm bảo tính minh bạch tuyệt đối.
                    </p>
                </div>
            )}
        </div>
    );
}