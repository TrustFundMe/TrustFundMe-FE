import { useState } from 'react';
import { X, DollarSign, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Expenditure } from '@/types/expenditure';
import { BankAccountDto } from '@/types/bankAccount';
import { mediaService } from '@/services/mediaService';
import { expenditureService } from '@/services/expenditureService';
import { toast } from 'react-hot-toast';

interface RefundExpenditureModalProps {
    isOpen: boolean;
    onClose: () => void;
    refundExpenditure: Expenditure;
    refundAmount: string;
    userBankAccounts: BankAccountDto[];
    userId?: number;
    onSuccess: () => void;
}

export default function RefundExpenditureModal({
    isOpen,
    onClose,
    refundExpenditure,
    refundAmount,
    userBankAccounts,
    userId,
    onSuccess
}: RefundExpenditureModalProps) {
    const [refundFile, setRefundFile] = useState<File | null>(null);
    const [refundFilePreview, setRefundFilePreview] = useState<string | null>(null);
    const [refundUploading, setRefundUploading] = useState(false);
    const [refundSubmitting, setRefundSubmitting] = useState(false);

    if (!isOpen || !refundExpenditure) return null;

    const payoutTx = refundExpenditure.transactions?.filter((t: any) => t.type === 'PAYOUT').slice(-1)[0];
    const adminBank = { name: payoutTx?.fromAccountHolderName, bank: payoutTx?.fromBankCode, account: payoutTx?.fromAccountNumber };
    const userBank = userBankAccounts.find(b => b.status === 'APPROVED') || userBankAccounts[0];

    const handleClose = () => {
        setRefundFilePreview(null);
        setRefundFile(null);
        onClose();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setRefundFile(file);
        const previewUrl = URL.createObjectURL(file);
        setRefundFilePreview(previewUrl);
        setRefundUploading(true);
        try {
            const uploaded = await mediaService.uploadMedia(
                file,
                refundExpenditure.campaignId,
                undefined,
                refundExpenditure.id,
                'Refund proof',
                'PHOTO'
            );
            setRefundFilePreview(uploaded.url);
        } catch {
            toast.error('Tải ảnh thất bại');
            setRefundFilePreview(null);
            setRefundFile(null);
        } finally {
            setRefundUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!refundAmount || Number(refundAmount) <= 0) { 
            toast.error('Số tiền không hợp lệ'); 
            return; 
        }
        if (!refundFilePreview || refundFilePreview.startsWith('blob:')) { 
            toast.error('Vui lòng đợi ảnh minh chứng tải lên hoàn tất'); 
            return; 
        }
        setRefundSubmitting(true);
        try {
            await expenditureService.createRefund(
                refundExpenditure.id,
                Number(refundAmount),
                refundFilePreview,
                userId
            );
            toast.success('Đã gửi hoàn tiền dư thành công!');
            handleClose();
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gửi hoàn tiền thất bại');
        } finally {
            setRefundSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-gray-900">Gửi hoàn tiền dư</h3>
                            <p className="text-[11px] text-gray-400">Tải lên ảnh chụp màn hình chuyển khoản</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                    {/* Amount (readonly) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Số tiền hoàn (VND)</label>
                        <input
                            type="number" min="0"
                            value={refundAmount}
                            readOnly
                            className="w-full rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-black text-orange-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Bank info cards */}
                    <div className="space-y-3">
                        {/* User (fund owner) — sender of refund */}
                        <div className="bg-orange-50 rounded-xl p-3.5 border border-orange-200">
                            <p className="text-[9px] font-black uppercase text-orange-400 tracking-widest mb-2">Người gửi (Chủ quỹ)</p>
                            {userBank ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div><span className="text-gray-400">Ngân hàng: </span><span className="font-bold text-gray-800">{userBank.bankCode || '—'}</span></div>
                                    <div><span className="text-gray-400">Số TK: </span><span className="font-bold text-gray-800">{userBank.accountNumber}</span></div>
                                    <div className="col-span-2"><span className="text-gray-400">Chủ TK: </span><span className="font-bold text-gray-800">{userBank.accountHolderName || '—'}</span></div>
                                </div>
                            ) : (
                                <p className="text-xs text-orange-400 italic">Chưa có thông tin tài khoản</p>
                            )}
                        </div>
                        {/* Admin — receiver of refund */}
                        <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-200">
                            <p className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-2">Người nhận (Nền tảng / Admin)</p>
                            {adminBank.account ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div><span className="text-gray-400">Ngân hàng: </span><span className="font-bold text-gray-800">{adminBank.bank || '—'}</span></div>
                                    <div><span className="text-gray-400">Số TK: </span><span className="font-bold text-gray-800">{adminBank.account}</span></div>
                                    <div className="col-span-2"><span className="text-gray-400">Chủ TK: </span><span className="font-bold text-gray-800">{adminBank.name || '—'}</span></div>
                                </div>
                            ) : (
                                <p className="text-xs text-blue-400 italic">Chưa có thông tin tài khoản</p>
                            )}
                        </div>
                    </div>

                    {/* Proof upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Ảnh chụp màn hình chuyển khoản <span className="text-red-400">*</span></label>
                        {refundFilePreview ? (
                            <div className="relative rounded-xl border-2 border-orange-200 overflow-hidden">
                                <img src={refundFilePreview} alt="Preview" className="w-full h-40 object-cover" />
                                <button
                                    onClick={() => { setRefundFilePreview(null); setRefundFile(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow text-gray-500 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${refundUploading ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'}`}>
                                {refundUploading ? (
                                    <>
                                        <Loader2 className="h-6 w-6 text-orange-400 animate-spin mb-2" />
                                        <span className="text-xs font-bold text-orange-600">Đang tải lên...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-7 w-7 text-gray-400 mb-2" />
                                        <span className="text-sm font-bold text-gray-600">Chọn ảnh chụp màn hình</span>
                                        <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WEBP</span>
                                    </>
                                )}
                                <input
                                    type="file" className="hidden" accept="image/*" disabled={refundUploading}
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        disabled={refundSubmitting || refundUploading || !refundFilePreview || !refundAmount || refundFilePreview.startsWith('blob:')}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-400 text-white text-sm font-bold hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow"
                    >
                        {refundSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                        {refundSubmitting ? 'Đang gửi...' : 'Xác nhận hoàn tiền'}
                    </button>
                </div>
            </div>
        </div>
    );
}
