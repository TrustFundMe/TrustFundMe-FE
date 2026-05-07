'use client';

import * as React from 'react';
import { useMemo, Fragment } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ExternalLink, Loader2, Receipt, ShoppingCart, Link as LinkIcon, Check, ImageIcon, ChevronRight, ChevronDown, Clock, XCircle, Info, Edit3 } from 'lucide-react';
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
    const [showPlan, setShowPlan] = React.useState(true);
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

    const renderPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.abs(n)) + ' VNĐ';
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
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">{expenditure.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-black rounded uppercase tracking-widest">Xem</span>
                                <span className="text-[10px] font-bold text-black uppercase tracking-widest truncate max-w-[500px]">Chiến dịch: {campaign?.title}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 mt-4">
                {/* SECTION 1: WITHDRAWAL OVERVIEW */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><Receipt className="w-4 h-4" /></div>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[2px]">Tổng quan rút tiền & Chứng từ</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-3">
                        <div className="space-y-3">
                            {/* Status / Deadline / Plan */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                                {/* Plan - first, large */}
                                <div>
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-0.5">Kế hoạch</span>
                                    <p className="text-lg font-black text-slate-900 leading-tight" title={expenditure.plan}>
                                        {expenditure.plan || 'Chưa cập nhật'}
                                    </p>
                                </div>
                                <div className="h-px bg-slate-100" />
                                {/* Status */}
                                {(() => {
                                    const getStatusStyles = (status?: string) => {
                                        switch (status) {
                                            case 'OVERDUE': return { label: 'Quá hạn', text: 'text-red-700' };
                                            case 'SUBMITTED': return { label: 'Đã nộp', text: 'text-amber-700' };
                                            case 'APPROVED': return { label: 'Đã duyệt', text: 'text-emerald-700' };
                                            case 'REJECTED': return { label: 'Bị từ chối', text: 'text-red-700' };
                                            case 'ALLOWED_EDIT': return { label: 'Cho phép sửa', text: 'text-orange-700' };
                                            default: return { label: 'Chưa cập nhật', text: 'text-slate-500' };
                                        }
                                    };
                                    const styles = getStatusStyles(expenditure.evidenceStatus);
                                    return (
                                        <div>
                                            <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-0.5">Trạng thái</span>
                                            <span className={`text-lg font-black ${styles.text}`}>{styles.label}</span>
                                        </div>
                                    );
                                })()}
                                <div className="h-px bg-slate-100" />
                                {/* Deadline */}
                                <div>
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-0.5">Hạn nộp</span>
                                    <span className={`text-lg font-black ${expenditure.evidenceDueAt && new Date(expenditure.evidenceDueAt) < new Date() ? 'text-red-600' : 'text-slate-900'}`}>
                                        {expenditure.evidenceDueAt
                                            ? (() => {
                                                const d = new Date(expenditure.evidenceDueAt);
                                                const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                                const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                return `${time} ${date}`;
                                            })()
                                            : 'Không giới hạn'}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div>
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-0.5">Số lần đã rút</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-lg font-black text-slate-900">{expenditure.evidences?.length || 0}</span>
                                        <span className="text-[10px] font-bold text-black uppercase tracking-widest">đợt</span>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div>
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-0.5">Tổng tiền đã rút</span>
                                    <span className="text-lg font-black text-emerald-600">{renderPrice(totalWithdrawn)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-4 py-1.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                <span className="text-[10px] font-black text-black uppercase tracking-widest">Danh sách các đợt rút tiền</span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
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
                                        ) : (ev.status === 'OVERDUE' || expenditure.evidenceStatus === 'OVERDUE') ? (
                                            <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-200">Quá hạn</span>
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
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><ShoppingCart className="w-5 h-5" /></div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[2px]">Danh sách hạng mục chi tiêu</h2>
                        </div>
                        <button
                            onClick={() => setShowPlan(!showPlan)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${showPlan ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {showPlan ? (
                                <><Clock className="w-3.5 h-3.5" /> Ẩn kế hoạch</>
                            ) : (
                                <><Clock className="w-3.5 h-3.5" /> Hiện kế hoạch</>
                            )}
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto font-sans">
                            <table className="w-full text-left border-collapse table-fixed lg:table-auto">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[50px] text-center border-x border-slate-200">STT</th>
                                        <th className="px-3 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[140px] text-center border-x border-slate-200">Danh mục</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-black uppercase tracking-[2px] min-w-[120px] w-[140px] border-x border-slate-200">Hạng mục</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[130px] border-x border-slate-200">Nơi mua / Link</th>
                                        <th className="px-3 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[120px] border-x border-slate-200">Hiệu / Thương hiệu</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[70px] text-center border-x border-slate-200">SL</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[70px] text-center border-x border-slate-200">ĐV</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[110px] text-right border-x border-slate-200">Đơn giá</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-black uppercase tracking-[2px] text-right min-w-[160px] w-[200px] border-x border-slate-200 bg-slate-100/50">Thành tiền</th>
                                        <th className="px-2 py-3 text-[10px] font-black text-black uppercase tracking-[2px] w-[90px] text-center border-x border-slate-200">Ảnh minh chứng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedItems).map(([id, group]) => {
                                        const groupRowSpan = group.items.reduce((acc, item) => {
                                            const hasPlan = (item.expectedQuantity || 0) > 0 || (item.expectedPrice || 0) > 0;
                                            return acc + (showPlan && hasPlan ? 2 : 1);
                                        }, 0);

                                        return (
                                            <Fragment key={id}>
                                                {group.items.map((item, itemIdx) => {
                                                    const hasPlan = (item.expectedQuantity || 0) > 0 || (item.expectedPrice || 0) > 0;
                                                    const itemRowSpan = (showPlan && hasPlan) ? 2 : 1;
                                                    const actualSubtotal = (item.actualQuantity || 0) * (item.actualPrice || 0);
                                                    const mediaList = itemMedia[item.id] || [];
                                                    const actualUnit = (item as any).actualUnit ?? item.unit ?? '';

                                                    let globalIdx = 0;
                                                    Object.entries(groupedItems).some(([gId, g]) => {
                                                        if (gId === id) {
                                                            globalIdx += itemIdx + 1;
                                                            return true;
                                                        }
                                                        globalIdx += g.items.length;
                                                        return false;
                                                    });

                                                    return (
                                                        <Fragment key={item.id}>
                                                            {/* ACTUAL ROW */}
                                                            <tr className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                                                                <td rowSpan={itemRowSpan} className="px-2 py-2 text-center text-[11px] font-black text-slate-400 border border-slate-200 bg-white">
                                                                    {globalIdx}
                                                                </td>

                                                                {itemIdx === 0 && (
                                                                    <td rowSpan={groupRowSpan} className="px-3 py-2 text-center align-middle border border-slate-200 bg-white min-w-[120px]">
                                                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight">
                                                                            {group.cat?.name || (id === 'other' ? 'Hạng mục phát sinh' : 'Danh mục mới')}
                                                                        </p>
                                                                    </td>
                                                                )}

                                                                <td className="px-4 py-1.5 border border-slate-200 bg-white">
                                                                    <div className="flex flex-col items-start gap-0.5 py-0">
                                                                        <p className="text-[12px] font-black text-slate-900 leading-[1.2]">{item.name}</p>
                                                                        {showPlan && (
                                                                            <span className="text-[7px] font-black text-white bg-emerald-500 px-1 py-0.5 rounded-[3px] uppercase tracking-[0.5px]">THỰC TẾ</span>
                                                                        )}
                                                                    </div>
                                                                </td>


                                                                <td className="px-2 py-1.5 border border-slate-200 bg-white">
                                                                    <p className="px-2 text-[11px] font-bold text-slate-600 truncate">{(item as any).actualPurchaseLocation ?? item.expectedPurchaseLocation ?? '---'}</p>
                                                                </td>

                                                                <td className="px-2 py-1.5 border border-slate-200 bg-white">
                                                                    <p className="px-2 text-[11px] font-bold text-slate-600 truncate">{item.actualBrand ?? item.expectedBrand ?? '---'}</p>
                                                                </td>

                                                                <td className="px-2 py-1.5 border border-slate-200 bg-white text-center">
                                                                    <p className="text-[12px] font-black text-slate-900">{isEvidenceSubmitted ? renderNumber(item.actualQuantity || 0) : '---'}</p>
                                                                </td>

                                                                <td className="px-2 py-1.5 border border-slate-200 bg-white text-center">
                                                                    <p className="text-[10px] font-bold text-slate-600 uppercase">{isEvidenceSubmitted ? (actualUnit || 'Cái') : '---'}</p>
                                                                </td>

                                                                <td className="px-2 py-1.5 border border-slate-200 bg-white text-right">
                                                                    <p className="text-[12px] font-black text-black">{isEvidenceSubmitted ? renderPrice(item.actualPrice || 0) : '---'}</p>
                                                                </td>

                                                                <td className="px-4 py-1.5 text-right border border-slate-200 bg-[#f8fafc]/50">
                                                                    <p className="text-[12px] font-black text-emerald-600">{isEvidenceSubmitted ? renderPrice(actualSubtotal) : '---'}</p>
                                                                </td>

                                                                <td className="px-2 py-1.5 border border-slate-200 text-center bg-white border-l border-slate-200">
                                                                    <button
                                                                        onClick={() => { setGalleryModalItemId(item.id); loadItemMedia(item.id); }}
                                                                        className="px-2 py-1 bg-slate-100 text-black text-[9px] font-black uppercase rounded hover:bg-slate-200 transition-colors"
                                                                    >
                                                                        Chi tiết
                                                                    </button>
                                                                </td>
                                                            </tr>

                                                            {/* PLAN ROW */}
                                                            {(showPlan && hasPlan) && (
                                                                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                                                                    <td className="px-4 py-1.5 border border-slate-200">
                                                                        <div className="flex flex-col items-start gap-0.5">
                                                                            <span className="text-[11px] font-bold italic leading-[1.2]">{item.name}</span>
                                                                            <span className="text-[7px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded-[4px] uppercase tracking-[0.5px]">KẾ HOẠCH</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border border-slate-200 bg-slate-50/50">
                                                                        <p className="px-2 text-[10px] font-bold italic truncate">{item.expectedPurchaseLocation || '---'}</p>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border border-slate-200 bg-slate-50/50">
                                                                        <p className="px-2 text-[10px] font-bold italic truncate">{item.expectedBrand || '---'}</p>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border border-slate-200 bg-slate-50/50 text-center">
                                                                        <p className="text-[11px] font-black italic">{renderNumber(item.expectedQuantity || 0)}</p>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border border-slate-200 bg-slate-50/50 text-center">
                                                                        <p className="text-[9px] font-bold uppercase italic">{item.expectedUnit || item.unit || '---'}</p>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border border-slate-200 bg-slate-50/50 text-right">
                                                                        <p className="text-[11px] font-black italic">{renderPrice(item.expectedPrice || 0)}</p>
                                                                    </td>
                                                                    <td className="px-4 py-1.5 border border-slate-200 text-right bg-slate-50/50">
                                                                        <p className="text-[11px] font-black italic">{renderPrice((item.expectedQuantity || 0) * (item.expectedPrice || 0))}</p>
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border border-slate-200 bg-slate-50/50"></td>
                                                                </tr>
                                                            )}
                                                        </Fragment>
                                                    );
                                                })}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white">
                                        <td colSpan={8} className="px-6 py-2.5 text-xs font-black uppercase tracking-[2px] text-right">Tổng thực tế:</td>
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
                    isReadOnly={true}
                    onClose={() => setGalleryModalItemId(null)}
                    itemName={currentGalleryItem?.name || 'Hạng mục'}
                    media={itemMedia[galleryModalItemId] || []}
                />
            )}
        </div>
    );
}
