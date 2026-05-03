'use client';

import * as React from 'react';
import { useMemo, Fragment } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ExternalLink, Loader2, Receipt, ShoppingCart, Link as LinkIcon, Check, ImageIcon, ChevronRight, ChevronDown, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useExpenditureDetailLogic } from './hooks/useExpenditureDetailLogic';
import ExpenditureGalleryModal from '@/components/campaign/ExpenditureGalleryModal';

export default function ExpenditureDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { isAuthenticated, loading: authLoading } = useAuth();
    const {
        expenditure, campaign, items, categories, loading, error,
        itemMedia, galleryModalItemId, setGalleryModalItemId,
        donationSummary, handleItemMediaUpload, handleDeleteItemMedia,
        handleItemFileChange, itemUploadState, loadItemMedia,
    } = useExpenditureDetailLogic(id, isAuthenticated, authLoading);

    const [collapsedCats, setCollapsedCats] = React.useState<Set<number | string>>(new Set());
    const toggleCategory = (catId: number | string) => {
        setCollapsedCats(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId); else next.add(catId);
            return next;
        });
    };

    const isEvidenceSubmitted = ['SUBMITTED', 'APPROVED', 'ALLOWED_EDIT'].includes(expenditure?.evidenceStatus || '');

    const totalWithdrawn = useMemo(() => (expenditure?.evidences || []).reduce((sum: number, ev: any) => sum + Math.abs(ev.amount || 0), 0), [expenditure]);
    const totalActualAmt = useMemo(() => items.reduce((sum, it) => sum + ((it.actualQuantity || 0) * (it.actualPrice || 0)), 0), [items]);

    const renderPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.abs(n)) + ' đ';
    const renderNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    const groupedItems = useMemo(() => {
        const groups: Record<number | string, { cat: any, items: any[] }> = {};
        const catMap: Record<number, any> = {};
        (categories || []).forEach(cat => { catMap[cat.id] = cat; groups[cat.id] = { cat, items: [] }; });
        items.forEach(item => {
            const catId = item.catologyId || 'other';
            if (!groups[catId]) groups[catId] = { cat: catId === 'other' ? null : (catMap[catId] || null), items: [] };
            groups[catId].items.push(item);
        });
        return groups;
    }, [items, categories]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm font-black text-black uppercase tracking-widest">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error || !expenditure) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-600">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p>{error || 'Không tìm thấy khoản chi'}</p>
                <Link href="/account/campaigns" className="mt-4 inline-block text-orange-600 font-medium">Quay lại danh sách</Link>
            </div>
        );
    }

    const currentGalleryItem = items.find(it => it.id === galleryModalItemId);

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-2.5 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link href={`/account/campaigns/expenditures?campaignId=${expenditure.campaignId}`} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100">
                            <ArrowLeft className="w-5 h-5 text-black" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Tổng quan đợt chi tiêu</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-black rounded uppercase tracking-widest">Xem</span>
                                <span className="text-[10px] font-bold text-black uppercase tracking-widest truncate max-w-[500px]">Chiến dịch: {campaign?.title}</span>
                                {expenditure.evidenceDueAt && (
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${new Date(expenditure.evidenceDueAt) < new Date() ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <Clock className="w-2.5 h-2.5" />
                                        Hạn nộp: {new Date(expenditure.evidenceDueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${isEvidenceSubmitted ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                        {isEvidenceSubmitted ? '✓ Đã nộp minh chứng' : 'Chưa cập nhật'}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 mt-4">
                {/* SECTION 1: WITHDRAWAL OVERVIEW */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Receipt className="w-5 h-5" /></div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[2px]">Tổng quan rút tiền & Chứng từ</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                        <div className="lg:col-span-1 space-y-3">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Số lần đã rút tiền</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900">{expenditure.evidences?.length || 0}</span>
                                    <span className="text-xs font-bold text-black uppercase tracking-widest">đợt</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Tổng tiền đã rút</span>
                                <span className="text-3xl font-black text-emerald-600">{renderPrice(totalWithdrawn)}</span>
                            </div>
                        </div>
                        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50">
                                <span className="text-[10px] font-black text-black uppercase tracking-widest">Danh sách các đợt rút tiền</span>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[280px]">
                                {(expenditure.evidences || []).map((ev: any, idx: number) => (
                                    <div key={ev.id || idx} className="px-6 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-black font-black text-[9px]">#{idx + 1}</div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-none">{renderPrice(ev.amount)}</p>
                                                <p className="text-[10px] font-bold text-black uppercase tracking-tighter mt-1">
                                                    {ev.createdAt ? new Date(ev.createdAt).toLocaleString('vi-VN') : '---'}
                                                </p>
                                            </div>
                                        </div>
                                        {ev.proofUrl ? (
                                            <a href={ev.proofUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                                <ImageIcon className="w-3.5 h-3.5" /> Xem bài viết minh chứng
                                            </a>
                                        ) : (
                                            <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100/50">Chờ nộp chứng từ</span>
                                        )}
                                    </div>
                                ))}
                                {(!expenditure.evidences || expenditure.evidences.length === 0) && (
                                    <div className="px-6 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Chưa có đợt rút tiền nào</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: ITEMS TABLE (read-only) */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><ShoppingCart className="w-5 h-5" /></div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[2px]">Danh sách hạng mục chi tiêu</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto font-sans">
                            <table className="w-full text-left border-collapse table-fixed lg:table-auto">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-4 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[240px]">Hạng mục</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[160px]">Link nơi mua</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[140px]">Nơi mua / Hiệu</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[80px] text-center">SL</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[100px] text-center">ĐV</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[130px] text-right">Đơn giá</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-black uppercase tracking-[2px] text-right w-[130px]">Thành tiền</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[70px] text-center">Ảnh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedItems).map(([catId, group]) => (
                                        <Fragment key={catId}>
                                            <tr className="bg-slate-100 border-b border-slate-200 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => toggleCategory(catId)}>
                                                <td colSpan={8} className="px-6 py-1.5">
                                                    <div className="flex items-center gap-2">
                                                        {collapsedCats.has(catId) ? <ChevronRight className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-emerald-600" />}
                                                        {catId === 'other' && <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Phát sinh</span>}
                                                        <span className="text-sm font-black text-emerald-800 uppercase tracking-widest">
                                                            Danh mục: {group.cat?.name || (catId === 'other' ? 'Hạng mục phát sinh' : 'Danh mục mới')}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {!collapsedCats.has(catId) && group.items.map((item: any) => {
                                                const actualSubtotal = (item.actualQuantity || 0) * (item.actualPrice || 0);
                                                const actualUnit = (item as any).actualUnit ?? item.unit ?? '';
                                                const mediaList = itemMedia[item.id] || [];
                                                return (
                                                    <Fragment key={item.id}>
                                                        {/* ACTUAL ROW */}
                                                        <tr className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-4 py-2.5">
                                                                <p className="text-sm font-black text-slate-900 leading-tight">{item.name}</p>
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                {item.actualPurchaseLink ? (
                                                                    <a href={item.actualPurchaseLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 truncate">
                                                                        <ExternalLink className="w-3 h-3 shrink-0" /> Link
                                                                    </a>
                                                                ) : <span className="text-[10px] text-slate-300">---</span>}
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                {isEvidenceSubmitted
                                                                    ? <span className="text-xs font-bold text-slate-700">{item.actualBrand || '---'}</span>
                                                                    : <span className="text-[10px] font-bold text-slate-300">Chưa cập nhật</span>}
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                {isEvidenceSubmitted
                                                                    ? <span className="text-sm font-black text-slate-900">{renderNumber(item.actualQuantity || 0)}</span>
                                                                    : <span className="text-[10px] font-bold text-slate-300">---</span>}
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                {isEvidenceSubmitted
                                                                    ? <span className="text-xs font-bold text-slate-700 uppercase">{actualUnit || '---'}</span>
                                                                    : <span className="text-[10px] font-bold text-slate-300">---</span>}
                                                            </td>
                                                            <td className="px-2 py-2 text-right">
                                                                {isEvidenceSubmitted
                                                                    ? <span className="text-sm font-black text-emerald-600">{renderPrice(item.actualPrice || 0)}</span>
                                                                    : <span className="text-[10px] font-bold text-slate-300">---</span>}
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                {isEvidenceSubmitted
                                                                    ? <span className="text-sm font-black text-slate-900">{renderPrice(actualSubtotal)}</span>
                                                                    : <span className="text-[10px] font-bold text-slate-300">Chưa cập nhật</span>}
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                <button
                                                                    onClick={() => { setGalleryModalItemId(item.id); loadItemMedia(item.id); }}
                                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all mx-auto ${mediaList.length > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
                                                                >
                                                                    <ImageIcon className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {/* PLAN ROW (ẩn cho hạng mục phát sinh) */}
                                                        {catId !== 'other' && <tr className="bg-slate-50/50 border-b border-slate-100">
                                                            <td colSpan={2} className="px-6 py-1.5 flex items-center gap-2">
                                                                <span className="text-[8px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest shrink-0">KẾ HOẠCH</span>
                                                                <span className="text-[10px] font-bold text-slate-500 truncate">{item.name}</span>
                                                            </td>
                                                            <td className="px-4 py-1.5 overflow-hidden">
                                                                {item.expectedPurchaseLink ? (
                                                                    <a href={item.expectedPurchaseLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1 truncate max-w-[160px]">
                                                                        <ExternalLink className="w-2.5 h-2.5" /> Link đính kèm
                                                                    </a>
                                                                ) : <span className="text-[10px] font-bold text-slate-400 italic">---</span>}
                                                            </td>
                                                            <td className="px-4 py-1.5 text-center"><span className="text-[10px] font-bold text-slate-500">{item.expectedBrand || '---'}</span></td>
                                                            <td className="px-4 py-1.5 text-center"><span className="text-[10px] font-black text-slate-500">{renderNumber(item.expectedQuantity || 0)}</span></td>
                                                            <td className="px-4 py-1.5 text-center"><span className="text-[10px] font-bold text-slate-500 uppercase">{item.expectedUnit || item.unit || '---'}</span></td>
                                                            <td className="px-4 py-1.5 text-right"><span className="text-[10px] font-black text-slate-500">{renderPrice(item.expectedPrice || 0)}</span></td>
                                                            <td className="px-6 py-1.5 text-right"><span className="text-[10px] font-black text-slate-500">{renderPrice((item.expectedQuantity || 0) * (item.expectedPrice || 0))}</span></td>
                                                            <td className="px-2 py-1.5"></td>
                                                        </tr>}
                                                    </Fragment>
                                                );
                                            })}
                                        </Fragment>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white">
                                        <td colSpan={6} className="px-6 py-2.5 text-xs font-black uppercase tracking-[2px] text-right">Tổng thực tế toàn chiến dịch:</td>
                                        <td colSpan={2} className="px-6 py-2.5 text-right text-lg font-black">
                                            {isEvidenceSubmitted ? renderPrice(totalActualAmt) : <span className="text-sm font-bold text-slate-400">Chưa cập nhật</span>}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: PROOF POST (read-only) */}
                <div className="my-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><LinkIcon className="w-5 h-5" /></div>
                        <h2 className="text-sm font-black text-black uppercase tracking-[2px]">Bài viết minh chứng tổng</h2>
                    </div>
                    {expenditure.proofUrl ? (
                        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 border border-emerald-100 rounded-3xl gap-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <Check className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-emerald-800 font-black mb-1">Đã đăng bài viết minh chứng</p>
                                <a href={expenditure.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center justify-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> Nhấn vào đây để xem
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <p className="text-xs text-slate-400 font-bold">Chưa có bài viết minh chứng tổng</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Modal (view-only, no upload for public view) */}
            {galleryModalItemId && (
                <ExpenditureGalleryModal
                    isOpen={!!galleryModalItemId}
                    onClose={() => setGalleryModalItemId(null)}
                    itemName={currentGalleryItem?.name || 'Hạng mục'}
                    media={itemMedia[galleryModalItemId] || []}
                    onFileChange={(files) => handleItemFileChange(galleryModalItemId, files)}
                    onUploadSubmit={() => handleItemMediaUpload(galleryModalItemId)}
                    uploadState={itemUploadState[galleryModalItemId] || { uploading: false, files: [], previews: [] }}
                    onDelete={(mediaId) => handleDeleteItemMedia(galleryModalItemId, mediaId)}
                />
            )}
        </div>
    );
}
