import { Fragment } from 'react';
import { X, Receipt, AlertCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { CampaignDto } from '@/types/campaign';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { MediaUploadResponse } from '@/services/mediaService';

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

interface UpdateExpenditureModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: CampaignDto;
    updateExpenditure: Expenditure;
    updateItemsData: ExpenditureItem[];
    updateItems: { id: number; actualQuantity: number; price: number }[];
    itemMedia: Record<number, MediaUploadResponse[]>;
    donationSummary: Record<number, number>;
    isRefundDone: boolean;
    handleUpdateItemChange: (index: number, field: 'actualQuantity' | 'price' | 'actualPurchaseLink', value: string) => void;
    handleUpdateSubmit: () => void;
    updating: boolean;
    setGalleryModalItemId: (id: number) => void;
    expenditures: Expenditure[];
}

export default function UpdateExpenditureModal({
    isOpen,
    onClose,
    campaign,
    updateExpenditure,
    updateItemsData,
    updateItems,
    itemMedia,
    donationSummary,
    isRefundDone,
    handleUpdateItemChange,
    handleUpdateSubmit,
    updating,
    setGalleryModalItemId,
    expenditures
}: UpdateExpenditureModalProps) {
    if (!isOpen || !updateExpenditure) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <div className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all align-middle sm:max-w-5xl sm:w-full max-h-[90vh] flex flex-col">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center gap-2" id="modal-title">
                                <Receipt className="w-5 h-5 text-emerald-500" />
                                Cập nhật Thực tế & Minh chứng
                            </h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-tighter">Vật phẩm</th>
                                        <th className="px-4 py-3 text-right text-xs font-black text-gray-900 uppercase tracking-tighter bg-gray-50">
                                            {campaign.type === 'ITEMIZED' ? 'Tổng giải ngân' : 'Kế hoạch'}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-black text-orange-600 uppercase tracking-tighter bg-orange-100">Thực tế (Nhập)</th>
                                        <th className="px-4 py-3 text-center text-xs font-black text-gray-500 uppercase tracking-tighter">Minh chứng</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {updateItemsData.map((item, index) => {
                                        const modalMedia = itemMedia[item.id] || [];
                                        return (
                                            <Fragment key={item.id}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        <div className="font-bold">{item.name}</div>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                                                            {item.expectedPurchaseLink && (
                                                                <a
                                                                    href={item.expectedPurchaseLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[9px] font-black text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                                                                    title="Link dự kiến"
                                                                >
                                                                    <ExternalLink className="w-2.5 h-2.5" /> DK
                                                                </a>
                                                            )}
                                                            {item.actualPurchaseLink && (
                                                                <a
                                                                    href={item.actualPurchaseLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                                                                    title="Link thực tế"
                                                                >
                                                                    <ExternalLink className="w-2.5 h-2.5" /> TT
                                                                </a>
                                                            )}
                                                        </div>
                                                        {item.note && <div className="text-[11px] text-gray-500 mt-1 leading-tight uppercase opacity-70 font-medium italic">{item.note}</div>}
                                                    </td>
                                                    <td className="px-4 py-2 text-right bg-gray-50/50 align-middle">
                                                        {campaign.type === 'ITEMIZED' ? (
                                                            <div className="flex items-center justify-end gap-3">
                                                                <div className="flex items-center gap-1 text-gray-900">
                                                                    <span className="text-xs font-normal">{(donationSummary[item.id] || 0)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-black/40 border-l border-gray-200 pl-3">
                                                                    <span className="text-[8px] font-black uppercase tracking-tighter">ĐG:</span>
                                                                    <span className="text-xs font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}</span>
                                                                </div>
                                                                <div className="ml-2 pl-3 border-l-2 border-gray-300 font-black text-gray-900 text-sm">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((donationSummary[item.id] || 0) * (item.expectedPrice || 0))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-3">
                                                                <div className="flex items-center gap-1 text-black/40">
                                                                    <span className="text-[8px] font-black uppercase tracking-tighter">SL:</span>
                                                                    <span className="text-xs font-normal">{item.quantity}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-black/40 border-l border-gray-200 pl-3">
                                                                    <span className="text-[8px] font-black uppercase tracking-tighter">ĐG:</span>
                                                                    <span className="text-xs font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}</span>
                                                                </div>
                                                                <div className="ml-2 pl-3 border-l-2 border-gray-300 font-black text-orange-600 text-sm">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * (item.expectedPrice || 0))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 bg-gray-50/10 align-middle">
                                                        <div className="flex items-center justify-end gap-3 text-orange-600/70">
                                                            <div className="flex items-center gap-1.5">
                                                                <label className="text-[8px] font-black uppercase tracking-tighter text-gray-400">SL:</label>
                                                                <input
                                                                    type="number" min="0"
                                                                    disabled={isRefundDone}
                                                                    className={`w-12 border-gray-200 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-xs font-bold text-right py-0.5 px-1 ${isRefundDone ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                    value={updateItems[index]?.actualQuantity || ''}
                                                                    onChange={(e) => handleUpdateItemChange(index, 'actualQuantity', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                                                <label className="text-[8px] font-black uppercase tracking-tighter text-gray-400">ĐG:</label>
                                                                <input
                                                                    type="number" min="0"
                                                                    disabled={isRefundDone}
                                                                    className={`w-24 border-gray-200 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-xs font-bold text-right py-0.5 px-1 ${isRefundDone ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                    value={updateItems[index]?.price || ''}
                                                                    onChange={(e) => handleUpdateItemChange(index, 'price', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                                                <label className="text-[8px] font-black uppercase tracking-tighter text-gray-400">Link:</label>
                                                                <input
                                                                    type="text"
                                                                    disabled={isRefundDone}
                                                                    placeholder="Link thực tế..."
                                                                    className={`w-32 border-gray-200 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-[10px] py-0.5 px-1 ${isRefundDone ? 'bg-gray-100 cursor-not-allowed' : ''} ${(updateItems[index] as any)?.actualPurchaseLink && !URL_REGEX.test((updateItems[index] as any).actualPurchaseLink) ? 'border-red-500 bg-red-50 text-red-600 font-bold' : ''}`}
                                                                    value={(updateItems[index] as any)?.actualPurchaseLink || ''}
                                                                    onChange={(e) => handleUpdateItemChange(index, 'actualPurchaseLink' as any, e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="ml-2 pl-3 border-l-2 border-orange-300 font-black text-orange-600 text-sm lg:text-base">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((updateItems[index]?.actualQuantity || 0) * (updateItems[index]?.price || 0))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 align-middle text-center">
                                                        <button
                                                            onClick={() => setGalleryModalItemId(item.id)}
                                                            className="flex flex-col items-center gap-1 group/btn mx-auto"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center group-hover/btn:bg-orange-50 group-hover/btn:border-orange-200 transition-all overflow-hidden shadow-sm">
                                                                {modalMedia.length > 0 ? (
                                                                    <div className="relative w-full h-full">
                                                                        <img src={modalMedia[0].url} className="w-full h-full object-cover" />
                                                                        {modalMedia.length > 1 && (
                                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[9px] text-white font-bold">
                                                                                +{modalMedia.length}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <ImageIcon className="w-4 h-4 text-gray-400 group-hover/btn:text-emerald-500" />
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 group-hover/btn:text-orange-400 font-bold uppercase tracking-tighter">Gallery</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-100 sticky bottom-0 z-10 border-t-2 border-gray-300">
                                    {(() => {
                                        const isItemized = campaign?.type === 'ITEMIZED';
                                        const totalPlan = updateItemsData.reduce((sum, item) => sum + item.quantity * (item.expectedPrice || 0), 0);
                                        const totalDonated = updateItemsData.reduce((sum, item) => sum + (donationSummary[item.id] || 0) * (item.expectedPrice || 0), 0);
                                        const totalActual = updateItems.reduce((sum, item) => sum + ((item?.actualQuantity || 0) * (item?.price || 0)), 0);
                                        const totalReceived = (updateExpenditure.totalReceivedAmount != null) ? Number(updateExpenditure.totalReceivedAmount) : 0;
                                        const latestDisbursed = [...expenditures].sort((a, b) => (b.id || 0) - (a.id || 0)).find(e => e.status === 'DISBURSED');
                                        const previousBalance = (latestDisbursed?.variance != null) ? Number(latestDisbursed.variance) : 0;

                                        const referenceTotal = isItemized ? totalDonated : totalPlan;
                                        const totalVariance = isItemized ? totalReceived - totalActual : referenceTotal - totalActual;
                                        const budgetLimit = campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (updateExpenditure.totalExpectedAmount || 0);
                                        const isOverBudget = totalActual > budgetLimit;

                                        return (
                                            <>
                                                <tr>
                                                    <td className="px-4 py-2 font-black text-gray-900 text-sm align-middle">TỔNG CỘNG (INVOICE TOTAL)</td>
                                                    <td className="px-4 py-2 text-right bg-gray-50 align-middle">
                                                        <div className="text-[10px] uppercase font-black text-gray-500 mb-0.5">
                                                            {isItemized ? 'Tổng giải ngân' : 'Tổng Kế hoạch'}
                                                        </div>
                                                        {isItemized ? (
                                                            <div className="text-gray-900 leading-tight">
                                                                <div className="text-2xl lg:text-3xl font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDonated)}</div>
                                                                <div className="text-[10px] font-bold text-gray-400">+ Rút thêm: {new Intl.NumberFormat('vi-VN').format(previousBalance)}</div>
                                                                <div className="text-2xl lg:text-3xl font-black mt-1">= {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalReceived)}</div>
                                                            </div>
                                                        ) : (
                                                            <div className={`text-3xl lg:text-4xl font-black text-orange-600`}>
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(referenceTotal)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-right bg-orange-100/50 align-middle">
                                                        <div className="text-[10px] uppercase font-black text-orange-400 mb-0.5 whitespace-nowrap">Tổng Thực tế đã chi</div>
                                                        <div className={`text-2xl lg:text-3xl font-black ${isOverBudget ? 'text-rose-600' : 'text-emerald-800'}`}>
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalActual)}
                                                        </div>
                                                        <div className={`mt-2 p-3 rounded-2xl border-2 ${totalVariance < 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                                                            <div className="text-[10px] uppercase font-black opacity-40 mb-1">
                                                                {isItemized ? 'Số dư' : (totalVariance < 0 ? 'Vượt hạn mức đợt chi tiêu' : 'Số dư cần hoàn')}
                                                            </div>
                                                            <div className="text-xl font-black">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(isItemized ? (totalReceived - totalActual) : totalVariance)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 bg-gray-100 align-middle"></td>
                                                </tr>
                                                {isOverBudget && (
                                                    <tr className="bg-rose-50">
                                                        <td colSpan={5} className="px-4 py-2 text-center text-[11px] font-black text-rose-600 uppercase tracking-widest border-t border-rose-200">
                                                            <AlertCircle className="w-4 h-4 inline-block mr-2 align-text-bottom" />
                                                            Tổng chi thực tế vượt quá ngân sách cho phép ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(budgetLimit)})
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })()}
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 shrink-0">
                        <button
                            type="button"
                            onClick={handleUpdateSubmit}
                            disabled={updating || isRefundDone}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:w-auto sm:text-sm ${updating || isRefundDone ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-400 hover:bg-orange-500 text-white'}`}
                        >
                            {updating ? 'Đang lưu...' : isRefundDone ? 'Đã hoàn tiền (Không thể sửa)' : 'Lưu cập nhật'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
