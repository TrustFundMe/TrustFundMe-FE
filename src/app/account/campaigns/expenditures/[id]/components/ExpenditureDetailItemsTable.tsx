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
    const circleRadius = 24;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circleCircumference - (p / 100) * circleCircumference;
    return (
        <div className="flex flex-col items-center justify-center mx-auto py-1.5">
            <div className="relative flex items-center justify-center w-14 h-14">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-[#065F46]/10" />
                    <circle
                        cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="5" fill="transparent"
                        strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
                        className="text-[#065F46]  transition-all duration-1000 ease-in-out"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center mt-0.5">
                    <span className="text-[12px] font-black text-[#065F46] tabular-nums leading-none tracking-tighter">{p}%</span>
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

    const isEvidenceSubmitted = ['SUBMITTED', 'APPROVED', 'ALLOWED_EDIT'].includes(expenditure?.evidenceStatus);

    return (
        <div className="bg-white shadow-sm rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <div className="px-4 py-2 border-b border-[#E2E8F0] bg-[#F1F5F9] shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-[12px] font-bold text-[#1E293B] flex items-center">
                        <Receipt className="w-3.5 h-3.5 mr-1.5 text-[#64748B]" />
                        Danh sách vật phẩm/chi phí ({items.length})
                    </h2>
                    <button
                        onClick={handleExportItems}
                        className="inline-flex items-center px-2 py-1 border border-[#E2E8F0] text-[10px] font-bold rounded text-[#1E293B] bg-white hover:bg-[#F8FAFC] transition-all shadow-sm"
                        title="Xuất Excel hạng mục"
                    >
                        <Download className="w-3 h-3 mr-1" />
                        Xuất Excel
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
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
                                <col className="w-[220px]" />
                            </>
                        ) : (
                            <>
                                <col className="w-[140px]" />
                                <col className="w-[140px]" />
                                <col className="w-[140px]" />
                                <col className="w-[180px]" />
                                <col className="w-[120px]" />
                            </>
                        )}
                    </colgroup>
                    <thead className="bg-[#F1F5F9] sticky top-0 z-20 shadow-sm border-b border-[#E2E8F0]">
                        <tr>
                            <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">STT</th>
                            <th className="px-2 py-2 text-left text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Tên hàng hóa / Dịch vụ</th>
                            <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Ảnh</th>
                            {campaign?.type === 'AUTHORIZED' ? (
                                <>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Kế hoạch (SL x ĐG)</th>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Tổng cộng</th>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Thực chi (SL x ĐG)</th>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B]">Tiến độ</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Kế hoạch (SL x ĐG)</th>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Quyên góp (SL x ĐG)</th>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Đã chi (SL x ĐG)</th>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B] border-r border-[#E2E8F0]">Tiến độ</th>
                                    <th className="px-2 py-2 text-center text-xs font-black text-[#1E293B]">DS Người QG</th>
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
                            const priceColorClass = priceDiff > 0 ? "text-rose-500" : (priceDiff < 0 ? "text-[#065F46]" : "text-[#1E293B]");

                            return (
                                <Fragment key={item.id}>
                                    <tr className="hover:bg-[#F8FAFC] transition-colors">
                                        <td className="px-2 py-2 text-center border-r border-[#E2E8F0] text-xs font-black text-[#64748B]">{idx + 1}</td>
                                        <td className="px-2 py-2 border-r border-[#E2E8F0]">
                                            <div className="flex items-center gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-[14px] font-bold text-[#1E293B] truncate">{item.category}</div>
                                                    {item.note && <div className="text-[11px] text-[#64748B] truncate italic mt-0.5">{item.note}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-center border-r border-[#E2E8F0]">
                                            <button
                                                onClick={() => {
                                                    setGalleryModalItemId(item.id);
                                                    loadItemMedia(item.id);
                                                }}
                                                className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:border-[#065F46]/40 hover:bg-[#065F46]/5 transition-all bg-white text-[10px] font-black text-[#065F46] uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {media.length > 0 ? `Xem (${media.length})` : 'Xem'}
                                            </button>
                                        </td>
                                        {campaign?.type === 'AUTHORIZED' ? (
                                            <>
                                                <td className="px-2 py-2 text-center text-[14px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    {(item.quantity || 0)} <span className="mx-1">x</span> <span className="font-bold text-[#1E293B] text-[15px]">{new Intl.NumberFormat('vi-VN').format(item.expectedPrice || 0)}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center text-base font-black text-blue-500 border-r border-[#E2E8F0]">
                                                    {new Intl.NumberFormat('vi-VN').format(planTotal)} đ
                                                </td>
                                                <td className="px-2 py-2 text-center text-[14px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    {isEvidenceSubmitted ? (
                                                        <>
                                                            {(item.actualQuantity || 0)} <span className="mx-1">x</span> 
                                                            <span className={`inline-flex items-center gap-0.5 font-bold ${priceColorClass} text-[15px]`}>
                                                                {new Intl.NumberFormat('vi-VN').format(item.price || 0)}
                                                                {priceDiff > 0 && <ArrowUp className="w-3 h-3" />}
                                                                {priceDiff < 0 && <ArrowDown className="w-3 h-3" />}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[12px] font-bold text-slate-400">Chưa cập nhật</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center justify-between gap-4 w-full">
                                                        <div className="flex-1 h-6 bg-[#065F46]/15 rounded-full overflow-hidden shadow-inner border border-black/5">
                                                            <div className="h-full rounded-full bg-[#065F46] " style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-lg font-black text-[#065F46] tabular-nums leading-none min-w-[60px] text-right">
                                                            {Math.round(progress)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-2 py-2 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    {(item.quantity || 0)} <span className="mx-1">x</span> <span className="font-bold text-[#1E293B] text-[12px]">{new Intl.NumberFormat('vi-VN').format(item.expectedPrice || 0)}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    <span className="font-medium text-[#1E293B] text-[12px]">{(donationSummary[item.id] || 0)}</span> <span className="mx-1">x</span> <span className="font-bold text-[#1E293B] text-[12px]">{new Intl.NumberFormat('vi-VN').format(item.expectedPrice || 0)}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center text-[11px] text-[#64748B] border-r border-[#E2E8F0]">
                                                    {isEvidenceSubmitted ? (
                                                        <>
                                                            <span className="font-bold text-[#1E293B] text-[12px]">{(item.actualQuantity || 0)}</span> <span className="mx-1">x</span>
                                                            <span className={`inline-flex items-center gap-0.5 font-bold ${priceColorClass} text-[12px]`}>
                                                                {new Intl.NumberFormat('vi-VN').format(item.price || 0)}
                                                                {priceDiff > 0 && <ArrowUp className="w-3 h-3" />}
                                                                {priceDiff < 0 && <ArrowDown className="w-3 h-3" />}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-400">Chưa cập nhật</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 border-r border-[#E2E8F0]">
                                                    <div className="flex items-center justify-between gap-3 w-full">
                                                        <div className="flex-1 h-4 bg-[#065F46]/15 rounded-full overflow-hidden shadow-inner border border-black/5">
                                                            <div className="h-full rounded-full bg-[#065F46] " style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-black text-[#065F46] tabular-nums leading-none min-w-[45px] text-right">
                                                            {Math.round(progress)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 text-center">
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
                    <tfoot className="sticky bottom-0 z-20 bg-[#F1F5F9] border-t-2 border-[#E2E8F0] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                        <tr className="font-black text-[#1E293B]">
                            <td className="px-2 py-3 text-xs uppercase border-r border-[#E2E8F0] text-center">Σ</td>
                            <td className="px-2 py-3 border-r border-[#E2E8F0] text-xs font-black uppercase">TỔNG CỘNG</td>
                            <td className="px-2 py-3 border-r border-[#E2E8F0]"></td>
                            {campaign?.type === 'AUTHORIZED' ? (
                                <>
                                    <td className="px-2 py-3 border-r border-[#E2E8F0]"></td>
                                    <td className="px-2 py-3 text-center border-r border-[#E2E8F0] text-sm text-blue-500 tabular-nums lowercase">{new Intl.NumberFormat('vi-VN').format(totalPlan)} đ</td>
                                    <td className="px-2 py-3 text-center border-r border-[#E2E8F0] text-sm text-amber-600 tabular-nums lowercase">
                                        {isEvidenceSubmitted ? `${new Intl.NumberFormat('vi-VN').format(totalActual)} đ` : <span className="text-[10px] font-bold text-slate-400">Chưa cập nhật</span>}
                                    </td>
                                    <td className="px-2 py-3 border-r border-[#E2E8F0]">
                                        <ProgressCircle percent={Math.round((totalActual / (totalPlan || 1)) * 100)} />
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-2 py-3 text-center border-r border-[#E2E8F0] text-sm text-[#1E293B] font-black tabular-nums">{new Intl.NumberFormat('vi-VN').format(totalPlan)} đ</td>
                                    <td className="px-2 py-2 border-r border-[#E2E8F0] align-top bg-[#F8FAFC]/50">
                                        <div className="flex flex-col gap-1 items-end text-xs tabular-nums leading-tight pb-1">
                                            <div className="flex justify-between w-full text-[#1E293B]">
                                                <span>Quyên góp:</span>
                                                <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(tongQuyenGop)} đ</span>
                                            </div>
                                            <div className="flex justify-between w-full text-[#1E293B]">
                                                <span>Rút thêm:</span>
                                                <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(rutThem)} đ</span>
                                            </div>
                                            <div className="w-[90%] border-t border-black/5 my-1 ml-auto"></div>
                                            <div className="flex justify-between w-full text-[#065F46] mt-0.5">
                                                <span className="font-black uppercase tracking-tighter">Giải ngân:</span>
                                                <span className="font-black">{new Intl.NumberFormat('vi-VN').format(totalReceived)} đ</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 border-r border-[#E2E8F0] align-top bg-[#F8FAFC]/50">
                                        <div className="flex flex-col gap-1.5 items-end text-[13px] tabular-nums leading-tight">
                                            <div className="flex justify-between w-full text-[#1E293B]">
                                                <span>Đã chi:</span>
                                                <span className="font-bold text-[14px]">
                                                    {isEvidenceSubmitted ? `${new Intl.NumberFormat('vi-VN').format(totalActual)} đ` : <span className="text-[10px] lowercase text-slate-400 font-bold">Chưa cập nhật</span>}
                                                </span>
                                            </div>
                                            <div className="w-[90%] border-t border-black/5 my-0.5 ml-auto"></div>
                                            <div className="flex justify-between w-full text-[#065F46]">
                                                <span className="font-black uppercase tracking-tighter">Số dư:</span>
                                                <span className="font-black text-[14px]">
                                                    {isEvidenceSubmitted ? `${new Intl.NumberFormat('vi-VN').format(expenditure?.variance || 0)} đ` : <span className="text-[10px] lowercase text-slate-400 font-bold">Chưa cập nhật</span>}
                                                </span>
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
