'use client';

import { useEffect, useState } from 'react';
import { Building2, User, Hash, AlertCircle, Lock } from 'lucide-react';
import { bankAccountService } from '@/services/bankAccountService';
import { useAuth } from '@/contexts/AuthContextProxy';

function ErrorText({ show, message }: { show: boolean; message?: string }) {
    if (!show || !message) return null;
    return <div className="mt-1 text-[10px] font-bold text-red-600 ml-2 uppercase tracking-wider">{message}</div>;
}

interface Step4BankingProps {
    data: any;
    onChange: (key: any, value: any) => void;
    errors: Record<string, string>;
    showErrors: boolean;
}

export default function Step4Banking({ data, onChange, errors, showErrors }: Step4BankingProps) {
    const { user } = useAuth();
    const [existingAccounts, setExistingAccounts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mode, setMode] = useState<'select' | 'create'>('select');

    const bankAccount = data.bankAccount || {
        id: undefined,
        bankCode: '',
        accountNumber: '',
        accountHolderName: '',
    };

    useEffect(() => {
        const fetchBankAccounts = async () => {
            if (!user?.id) return;
            try {
                // Use getMyBankAccounts to retrieve the current user's accounts
                const accounts = await bankAccountService.getMyBankAccounts();
                setExistingAccounts(accounts);

                // If user has existing accounts, auto-fill the first one and disable editing
                if (accounts.length > 0) {
                    const first = accounts[0];
                    onChange('bankAccount', {
                        id: first.id,
                        bankCode: first.bankCode,
                        accountNumber: first.accountNumber,
                        accountHolderName: first.accountHolderName,
                    });
                }
            } catch (err) {
                console.error('Failed to fetch bank accounts:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBankAccounts();
    }, [user?.id]);

    const updateBank = (field: string, value: string) => {
        if (existingAccounts.length > 0) return; // Prevent editing if account exists
        onChange('bankAccount', { ...bankAccount, [field]: value });
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto w-full flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dc2626] border-t-transparent" />
            </div>
        );
    }

    const isReadOnly = existingAccounts.length > 0;

    return (
        <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-black tracking-tight">Thông tin nhận quỹ</h3>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest">
                    {isReadOnly
                        ? 'Tài khoản ngân hàng của bạn đã được xác thực'
                        : 'Vui lòng cung cấp tài khoản ngân hàng chính chủ'}
                </p>
            </div>

            <div className="relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
                <div className="space-y-6">
                    {/* Ngân hàng */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">Ngân hàng thụ hưởng</label>
                        <div className={`group flex items-center gap-4 px-6 h-14 rounded-2xl border-2 transition-all ${showErrors && errors.bankCode && !isReadOnly
                            ? 'bg-red-50/30 border-red-200 shadow-none'
                            : isReadOnly
                                ? 'bg-gray-50 border-transparent'
                                : 'bg-white border-black/5 focus-within:border-[#dc2626]/20 focus-within:shadow-xl focus-within:shadow-red-50'
                            }`}>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${showErrors && errors.bankCode && !isReadOnly
                                ? 'bg-red-100 text-red-600'
                                : isReadOnly
                                    ? 'bg-black/5 text-black/40'
                                    : 'bg-gray-50 text-black/20 group-focus-within:bg-red-50 group-focus-within:text-[#dc2626]'
                                }`}>
                                <Building2 className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={bankAccount.bankCode}
                                onChange={(e) => updateBank('bankCode', e.target.value)}
                                placeholder="Ví dụ: Vietcombank, Techcombank..."
                                disabled={isReadOnly}
                                className="flex-1 bg-transparent border-none p-0 text-sm font-black text-black placeholder:text-black/10 focus:ring-0 disabled:text-black/60"
                            />
                            {isReadOnly && <Lock className="h-4 w-4 text-black/20" />}
                        </div>
                        <ErrorText show={showErrors && !isReadOnly} message={errors.bankCode} />
                    </div>

                    {/* Số tài khoản */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">Số tài khoản</label>
                        <div className={`group flex items-center gap-4 px-6 h-14 rounded-2xl border-2 transition-all ${showErrors && errors.accountNumber && !isReadOnly
                            ? 'bg-red-50/30 border-red-200 shadow-none'
                            : isReadOnly
                                ? 'bg-gray-50 border-transparent'
                                : 'bg-white border-black/5 focus-within:border-[#dc2626]/20 focus-within:shadow-xl focus-within:shadow-red-50'
                            }`}>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${showErrors && errors.accountNumber && !isReadOnly
                                ? 'bg-red-100 text-red-600'
                                : isReadOnly
                                    ? 'bg-black/5 text-black/40'
                                    : 'bg-gray-50 text-black/20 group-focus-within:bg-red-50 group-focus-within:text-[#dc2626]'
                                }`}>
                                <Hash className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={bankAccount.accountNumber}
                                onChange={(e) => updateBank('accountNumber', e.target.value)}
                                placeholder="Nhập số tài khoản của bạn"
                                disabled={isReadOnly}
                                className="flex-1 bg-transparent border-none p-0 text-sm font-black tracking-widest text-black placeholder:text-black/10 focus:ring-0 disabled:text-black/60"
                            />
                            {isReadOnly && <Lock className="h-4 w-4 text-black/20" />}
                        </div>
                        <ErrorText show={showErrors && !isReadOnly} message={errors.accountNumber} />
                    </div>

                    {/* Tên chủ tài khoản */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">Tên chủ tài khoản</label>
                        <div className={`group flex items-center gap-4 px-6 h-14 rounded-2xl border-2 transition-all ${showErrors && errors.accountHolderName && !isReadOnly
                            ? 'bg-red-50/30 border-red-200 shadow-none'
                            : isReadOnly
                                ? 'bg-gray-50 border-transparent'
                                : 'bg-white border-black/5 focus-within:border-[#dc2626]/20 focus-within:shadow-xl focus-within:shadow-red-50'
                            }`}>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${showErrors && errors.accountHolderName && !isReadOnly
                                ? 'bg-red-100 text-red-600'
                                : isReadOnly
                                    ? 'bg-black/5 text-black/40'
                                    : 'bg-gray-50 text-black/20 group-focus-within:bg-red-50 group-focus-within:text-[#dc2626]'
                                }`}>
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={bankAccount.accountHolderName}
                                onChange={(e) => updateBank('accountHolderName', e.target.value.toUpperCase())}
                                placeholder="VIET HOA KHONG DAU"
                                disabled={isReadOnly}
                                className="flex-1 bg-transparent border-none p-0 text-sm font-black uppercase text-black placeholder:text-black/10 focus:ring-0 disabled:text-black/60"
                            />
                            {isReadOnly && <Lock className="h-4 w-4 text-black/20" />}
                        </div>
                        <ErrorText show={showErrors && !isReadOnly} message={errors.accountHolderName} />
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-6 rounded-3xl bg-red-50/50 border border-red-100">
                <AlertCircle className="h-5 w-5 text-[#dc2626] shrink-0" />
                <p className="text-[11px] font-bold text-red-800 leading-relaxed italic">
                    Lưu ý: Vui lòng đảm bảo thông tin ngân hàng khớp với hồ sơ cá nhân để được duyệt nhanh hơn. Thông tin này sẽ được dùng để nhận quỹ quyên góp.
                </p>
            </div>
        </div>
    );
}

