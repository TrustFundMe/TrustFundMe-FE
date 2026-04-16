'use client';

import * as React from 'react';
import { Fragment, useState } from 'react';
import { Receipt, Download, Package, ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { ItemDonorsModal } from './ItemDonorsModal';

interface ExpenditureDetailItemsTableProps {
    items: any[];
    campaign: any;
    itemMedia: Record<number, any[]>;
    donationSummary: Record<number, number>;
    handleExportItems: () => void;
    setGalleryModalItemId: (id: number | null) => void;
    loadItemMedia: (id: number) => void;
    totalPlan: number;
    totalActual: number;
    totalReceived: number;
    expenditure: any;
}

const ProgressCircle = ({ percent }: { percent: number }) => {
    const p = Math.min(Math.max(percent, 0), 100);
    const circleRadius = 20;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circleCircumference - (p / 100) * circleCircumference;
    return (
        <div className="flex flex-col items-center justify-center mx-auto py-1">
            <div className="relative flex items-center justify-center w-12 h-12">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4.5" fill="transparent" className="text-emerald-500/10" />
                    <circle
                        cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4.5" fill="transparent"
                        strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
                        className="text-emerald-500 drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-in-out"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center mt-0.5">
                    <span className="text-[11px] font-black text-emerald-600 tabular-nums leading-none tracking-tighter">{p}%</span>
                </div>
            </div>
        </div>
    );
};

const ExpenditureDetailItemsTable: React.FC<ExpenditureDetailItemsTableProps> = ({
    items, campaign, itemMedia, donationSummary, handleExportItems,
    setGalleryModalItemId, loadItemMedia, totalPlan, totalActual, totalReceived, expenditure
}) => {
    const [donorModalItem, setDonorModalItem] = useState<{id: number, name: string} | null>(null);

    const tongQuyenGop = items.reduce((sum, item) => sum + ((donationSummary[item.id] || 0) * (item.expectedPrice || 0)), 0);
    const rutThem = Math.max(totalReceived - tongQuyenGop, 0);

    return (
        <div className="bg-white shadow-sm rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="px-4 py-2.5 border-b border-[#E2E8F0] bg-[#F1F5F9] shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#1E293B] flex items-center">
                        <Receipt className="w-4 h-4 mr-1.5 text-[#64748B]" />
                        Danh sách vật phẩm/chi phí ({items.length})
                    </h2>
                    <button
                        onClick={handleExportItems}
                        className="inline-flex items-center px-2 py-1 border border-[#E2E8F0] text-[10px] font-bold rounded text-[#1E293B] bg-white hover:bg-slate-50 transition-all shadow-sm"
                        title="Xuất Excel hạng mục"
                    >
                        <Download className="w-3 h-3 mr-1" />
                        Xuất Excel
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
                <table className="w-full text-sm table-fixed border-collapse">
                    <colgroup>
                        <col className="w-[50px]" />
                        <col className="w-[200px]" />
                        <col className="w-[80px]" />
                        {campaign?.type === 'AUTHORIZED' ? (
                            <>
                                <col className="w-[180px]" />
                                <col className="w-[120px]" />
                                <col className="w-[180px]" />
                                <col className="w-[90px]" />
                            </>
                        ) : (
                            <>
                                <col className="w-[140px]" />
                                <col className="w-[140px]" />
                                <col className="w-[140px]" />
                                <col className="w-[90px]" />
                                <col className="w-[120px]" />
                            </>
                        )}
                    </colgroup>
                    <thead className="bg-[#F1F5F9] sticky top-0 z-20 shadow-sm border-b border-[#E2E8F0]">
                        <tr>
                            <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">STT</th>
                            <th className="px-2 py-3 text-left text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Tên hàng hóa / Dịch vụ</th>
                            <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Ảnh</th>
                            {campaign?.type === 'AUTHORIZED' ? (
                                <>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Kế hoạch (SL x ĐG)</th>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Tổng cộng</th>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Thực chi (SL x ĐG)</th>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B]">Tiến độ</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Kế hoạch (SL x ĐG)</th>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Quyên góp (SL x ĐG)</th>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Đã chi (SL x ĐG)</th>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Tiến độ</th>
                                    <th className="px-2 py-3 text-center text-xs font-black text-[#1E293B]">DS Người QG</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E2E8F0]">
                        {items.map((item, idx) => {
                            const media = itemMedia[item.id] || [];
                            const planTotal = (item.quantity || 0) * (item.expectedPrice || 0);
                            const actualTotal = (item.actualQuantity || 0) * (item.price || 0);
                            const progress = campaign?.type === 'AUTHORIZED'
                                ? ((item.actualQuantity || 0) / (item.quantity || 1)) * 100
                                : ((donationSummary[item.id] || 0) / (item.quantity || 1)) * 100;
                            
                            const priceDiff = (item.price || 0) - (item.expectedPrice || 0);
                            const priceColorClass = priceDiff > 0 ? "text-rose-500" : (priceDiff < 0 ? "text-[#10B981]" : "text-[#1E293B]");

                            return (
                                <Fragment key={item.id}>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-2 py-3 text-center border-r border-[#E2E8F0] text-xs font-black text-[#64748B]">{idx + 1}</td>
                                        <td className="px-2 py-3 border-r border-[#E2E8F0]">
                                            <div className="flex items-center gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-bold text-[#1E293B] truncate">{item.category}</div>
                                                    {item.note && <div className="text-[10px] text-[#64748B] truncate italic mt-0.5">{item.note}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center border-r border-[#E2E8F0]">
                                            <button
                                                onClick={() => {
                                                    setGalleryModalItemId(item.id);
                                                    loadItemMedia(item.id);
                                                }}
                                                className="w-10 h-10 rounded-lg border border-[#E2E8F0] overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all bg-white"
                                            >
                                                {media.length > 0 ? (
                                                    <img src={media[0].url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                )}
                                            </button>
                                        </td>
                                        {campaign?.type === 'AUTHORIZED' ? (
                                            <>
                                                <td className="px-2 py-3 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    {(item.quantity || 0)} <span className="mx-1">x</span> <span className="font-bold text-[#1E293B] text-[12px]">{new Intl.NumberFormat('vi-VN').format(item.expectedPrice || 0)}</span>
                                                </td>
                                                <td className="px-2 py-3 text-center text-xs font-black text-blue-500 border-r border-[#E2E8F0]">
                                                    {new Intl.NumberFormat('vi-VN').format(planTotal)} đ
                                                </td>
                                                <td className="px-2 py-3 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    {(item.actualQuantity || 0)} <span className="mx-1">x</span> 
                                                    <span className={`inline-flex items-center gap-0.5 font-bold ${priceColorClass} text-[12px]`}>
                                                        {new Intl.NumberFormat('vi-VN').format(item.price || 0)}
                                                        {priceDiff > 0 && <ArrowUp className="w-3 h-3" />}
                                                        {priceDiff < 0 && <ArrowDown className="w-3 h-3" />}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3">
                                                    <div className="flex items-center justify-between gap-1.5 w-full max-w-[70px] mx-auto">
                                                        <div className="flex-1 h-1.5 bg-[#10B981]/10 rounded-full overflow-hidden shadow-inner border border-[#10B981]/20">
                                                            <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-[#10B981] tabular-nums leading-none w-6 text-right">
                                                            {Math.round(progress)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-2 py-3 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    {(item.quantity || 0)} <span className="mx-1">x</span> <span className="font-bold text-[#1E293B] text-[12px]">{new Intl.NumberFormat('vi-VN').format(item.expectedPrice || 0)}</span>
                                                </td>
                                                <td className="px-2 py-3 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    <span className="font-bold text-[#1E293B] text-[12px]">{(donationSummary[item.id] || 0)}</span> <span className="mx-1">x</span> <span className="font-bold text-[#1E293B] text-[12px]">{new Intl.NumberFormat('vi-VN').format(item.expectedPrice || 0)}</span>
                                                </td>
                                                <td className="px-2 py-3 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    <span className="font-bold text-[#1E293B] text-[12px]">{(item.actualQuantity || 0)}</span> <span className="mx-1">x</span>
                                                    <span className={`inline-flex items-center gap-0.5 font-bold ${priceColorClass} text-[12px]`}>
                                                        {new Intl.NumberFormat('vi-VN').format(item.price || 0)}
                                                        {priceDiff > 0 && <ArrowUp className="w-3 h-3" />}
                                                        {priceDiff < 0 && <ArrowDown className="w-3 h-3" />}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 border-r border-[#E2E8F0]">
                                                    <div className="flex items-center justify-between gap-1.5 w-full max-w-[70px] mx-auto">
                                                        <div className="flex-1 h-1.5 bg-[#10B981]/10 rounded-full overflow-hidden shadow-inner border border-[#10B981]/20">
                                                            <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-[#10B981] tabular-nums leading-none w-6 text-right">
                                                            {Math.round(progress)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3 text-center">
                                                    <button 
                                                        onClick={() => setDonorModalItem({ id: item.id, name: item.category })}
                                                        className="text-[10px] text-[#1E293B] font-bold hover:underline opacity-80 flex mx-auto items-center"
                                                    >
                                                        Xem danh sách
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="shrink-0 border-t-2 border-[#E2E8F0] bg-[#F1F5F9]">
                <table className="w-full text-sm table-fixed border-collapse">
                    <colgroup>
                        <col className="w-[50px]" />
                        <col className="w-[200px]" />
                        <col className="w-[80px]" />
                        {campaign?.type === 'AUTHORIZED' ? (
                            <>
                                <col className="w-[180px]" />
                                <col className="w-[120px]" />
                                <col className="w-[180px]" />
                                <col className="w-[90px]" />
                            </>
                        ) : (
                            <>
                                <col className="w-[140px]" />
                                <col className="w-[140px]" />
                                <col className="w-[140px]" />
                                <col className="w-[90px]" />
                                <col className="w-[120px]" />
                            </>
                        )}
                    </colgroup>
                    <tfoot>
                        <tr className="font-black text-[#1E293B]">
                            <td className="px-2 py-3 text-xs uppercase border-r border-[#E2E8F0] text-center">Σ</td>
                            <td className="px-2 py-3 border-r border-[#E2E8F0]">TỔNG CỘNG</td>
                            <td className="px-2 py-3 border-r border-[#E2E8F0]"></td>
                            {campaign?.type === 'AUTHORIZED' ? (
                                <>
                                    <td className="px-2 py-3 border-r border-[#E2E8F0]"></td>
                                    <td className="px-2 py-3 text-center border-r border-[#E2E8F0] text-sm text-blue-500 tabular-nums">{new Intl.NumberFormat('vi-VN').format(totalPlan)} đ</td>
                                    <td className="px-2 py-3 text-center border-r border-[#E2E8F0] text-sm text-amber-600 tabular-nums">{new Intl.NumberFormat('vi-VN').format(totalActual)} đ</td>
                                    <td className="px-2 py-3 border-r border-[#E2E8F0]">
                                        <ProgressCircle percent={Math.round((totalActual / (totalPlan || 1)) * 100)} />
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-2 py-3 text-center border-r border-[#E2E8F0] text-sm text-[#1E293B] font-black tabular-nums">{new Intl.NumberFormat('vi-VN').format(totalPlan)} đ</td>
                                    <td className="px-2 py-2 border-r border-[#E2E8F0] align-top bg-slate-50/50">
                                        <div className="flex flex-col gap-1 items-end text-xs tabular-nums leading-tight pb-1">
                                            <div className="flex justify-between w-full text-[#1E293B]">
                                                <span>Quyên góp:</span>
                                                <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(tongQuyenGop)} đ</span>
                                            </div>
                                            <div className="flex justify-between w-full text-[#1E293B]">
                                                <span>Rút thêm:</span>
                                                <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(rutThem)} đ</span>
                                            </div>
                                            <div className="w-[90%] border-t border-slate-300 my-1 ml-auto"></div>
                                            <div className="flex justify-between w-full text-[#10B981] mt-0.5">
                                                <span className="font-black uppercase tracking-tighter">Giải ngân:</span>
                                                <span className="font-black">{new Intl.NumberFormat('vi-VN').format(totalReceived)} đ</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 border-r border-[#E2E8F0] align-top bg-slate-50/50">
                                        <div className="flex flex-col gap-1.5 items-end text-[13px] tabular-nums leading-tight">
                                            <div className="flex justify-between w-full text-[#1E293B]">
                                                <span>Đã chi:</span>
                                                <span className="font-bold text-[14px]">{new Intl.NumberFormat('vi-VN').format(totalActual)} đ</span>
                                            </div>
                                            <div className="w-[90%] border-t border-slate-300 my-0.5 ml-auto"></div>
                                            <div className="flex justify-between w-full text-slate-500">
                                                <span className="font-black uppercase tracking-tighter">Số dư:</span>
                                                <span className="font-black text-[14px]">{new Intl.NumberFormat('vi-VN').format(expenditure?.variance || 0)} đ</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 border-r border-[#E2E8F0]">
                                        <ProgressCircle percent={Math.round((totalReceived / (expenditure?.totalExpectedAmount || 1)) * 100)} />
                                    </td>
                                    <td className="px-2 py-3"></td>
                                </>
                            )}
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modals */}
            {donorModalItem && (
                <ItemDonorsModal
                    itemId={donorModalItem.id}
                    itemName={donorModalItem.name}
                    onClose={() => setDonorModalItem(null)}
                />
            )}
        </div>
    );
};

export default ExpenditureDetailItemsTable;
