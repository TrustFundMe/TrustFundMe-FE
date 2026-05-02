'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle, ExternalLink, Link as LinkIcon, Loader2, Save, ShoppingCart, Receipt, Calculator, Package, Info, Calendar, DollarSign, Image as ImageIcon, Trash2, Camera, Plus, PlusCircle, FolderPlus, X } from 'lucide-react';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { paymentService } from '@/services/paymentService';
import { mediaService, MediaUploadResponse } from '@/services/mediaService';
import { toast } from 'react-hot-toast';
import { Expenditure, ExpenditureItem, ExpenditureCatology } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';
import ExpenditureGalleryModal from '@/components/campaign/ExpenditureGalleryModal';
import CreateOrEditPostModal from '@/components/feed-post/CreateOrEditPostModal';

export default function UpdateExpenditureActualsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const expId = params ? Number(params.expId) : 0;
    const campaignId = searchParams ? searchParams.get('campaignId') : null;

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
    const [itemsData, setItemsData] = useState<ExpenditureItem[]>([]);
    const [categories, setCategories] = useState<ExpenditureCatology[]>([]);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; actualPrice: number; actualPurchaseLink?: string; actualBrand?: string; name?: string; catologyId?: number; isNew?: boolean; unit?: string }[]>([]);
    const [donationSummary, setDonationSummary] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Gallery Modal State
    const [galleryItemId, setGalleryItemId] = useState<number | null>(null);
    const [itemMedia, setItemMedia] = useState<Record<number, MediaUploadResponse[]>>({});
    const [uploadState, setUploadState] = useState<{ uploading: boolean; files: File[]; previews: string[] }>({
        uploading: false,
        files: [],
        previews: []
    });

    // New Category State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [globalProofUrl, setGlobalProofUrl] = useState('');

    // FeedPost Draft State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [currentDraftPost, setCurrentDraftPost] = useState<any>(null);

    const loadData = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [exp, items, cats] = await Promise.all([
                expenditureService.getById(expId),
                expenditureService.getItems(expId),
                expenditureService.getCategories(expId)
            ]);
            
            setExpenditure(exp);
            setItemsData(items);
            setCategories(cats);
            if (exp.proofUrl) setGlobalProofUrl(exp.proofUrl);
            
            // Sync updateItems with fetched items, keeping new unsaved items if any
            setUpdateItems(prevUpdateItems => {
                const existingUnsaved = prevUpdateItems.filter(ui => ui.isNew);
                const fetched = items.map(item => ({
                    id: item.id,
                    actualQuantity: item.actualQuantity ?? 0,
                    actualPrice: item.actualPrice ?? 0,
                    actualPurchaseLink: item.actualPurchaseLink ?? '',
                    actualBrand: item.actualBrand ?? '',
                    unit: item.unit
                }));
                return [...fetched, ...existingUnsaved];
            });

            // Load media for items
            const mediaMap: Record<number, MediaUploadResponse[]> = {};
            await Promise.all(items.map(async (item) => {
                try {
                    const media = await mediaService.getMediaByExpenditureItemId(item.id);
                    mediaMap[item.id] = media;
                } catch (e) {
                    mediaMap[item.id] = [];
                }
            }));
            setItemMedia(mediaMap);

            if (exp.campaignId) {
                const camp = await campaignService.getById(exp.campaignId);
                setCampaign(camp);

                if (camp.type === 'ITEMIZED') {
                    const summaries = await paymentService.getDonationSummary(items.map(i => i.id));
                    const map: Record<number, number> = {};
                    summaries.forEach(s => { map[s.expenditureItemId] = s.donatedQuantity; });
                    setDonationSummary(map);
                }
            }
        } catch (err) {
            toast.error('Không thể tải dữ liệu chi tiêu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (expId) loadData();
    }, [expId]);

    const handleItemChange = (itemId: number, field: string, value: any) => {
        setUpdateItems(prevItems => prevItems.map(item => 
            item.id === itemId 
                ? { ...item, [field]: (field === 'actualQuantity' || field === 'actualPrice') ? Math.abs(Number(value)) : value }
                : item
        ));
    };

    const handleAddNewItem = (catId?: number) => {
        const tempId = Date.now();
        setUpdateItems(prev => [...prev, {
            id: tempId,
            name: '',
            catologyId: catId,
            actualQuantity: 1,
            actualPrice: 0,
            actualPurchaseLink: '',
            actualBrand: '',
            unit: 'Cái',
            isNew: true
        }]);
    };

    const handleRemoveNewItem = (tempId: number) => {
        setUpdateItems(prev => prev.filter(it => it.id !== tempId));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setIsSubmitting(true);
            await expenditureService.createCategory(expId, newCategoryName);
            toast.success(`Đã thêm danh mục "${newCategoryName}"`);
            setNewCategoryName('');
            setIsAddingCategory(false);
            await loadData(true);
        } catch (err) {
            toast.error('Lỗi khi thêm danh mục.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        try {
            // 0. Strict Validation: totalActualAmt MUST match totalWithdrawn
            if (Math.abs(totalActualAmt - totalWithdrawn) > 1) {
                toast.error(`Tổng chi thực tế (${renderNumber(totalActualAmt)} đ) phải khớp hoàn toàn với tổng tiền đã rút (${renderNumber(totalWithdrawn)} đ). Vui lòng điều chỉnh lại.`);
                return;
            }

            if (!globalProofUrl) {
                toast.error(`Vui lòng "Soạn bài viết minh chứng" ở Phần 3 trước khi lưu để hoàn tất cập nhật.`);
                return;
            }

            setIsSubmitting(true);
            
            // 1. Separate new items from existing ones
            const newItemsToCreate = updateItems.filter(it => it.isNew && it.name);
            const itemsToUpdate = updateItems.filter(it => !it.isNew);

            // 2. Create new items if any
            if (newItemsToCreate.length > 0) {
                const payload = newItemsToCreate.map(it => ({
                    name: it.name || 'Hạng mục mới',
                    catologyId: it.catologyId,
                    expectedQuantity: 0,
                    expectedPrice: 0,
                    actualQuantity: it.actualQuantity,
                    actualPrice: it.actualPrice,
                    actualPurchaseLink: it.actualPurchaseLink,
                    actualBrand: it.actualBrand,
                    unit: it.unit || 'Cái'
                }));
                await expenditureService.addItems(expId, payload as any);
            }

            // 3. Update existing items
            await expenditureService.updateActuals(expId, itemsToUpdate as any, globalProofUrl);
            
            toast.success('Cập nhật dữ liệu thành công!');
            router.push(`/account/campaigns/expenditures?campaignId=${campaign?.id}`);
        } catch (err: any) {
            toast.error('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Media Logic
    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setUploadState(prev => ({
            ...prev,
            files: [...prev.files, ...newFiles],
            previews: [...prev.previews, ...newPreviews]
        }));
    };

    const handleUploadSubmit = async () => {
        if (!galleryItemId || uploadState.files.length === 0) return;
        try {
            setUploadState(prev => ({ ...prev, uploading: true }));
            for (const file of uploadState.files) {
                await mediaService.uploadMedia(file, undefined, undefined, expenditure?.id, undefined, 'PHOTO', undefined, galleryItemId);
            }
            const updatedMedia = await mediaService.getMediaByExpenditureItemId(galleryItemId);
            setItemMedia(prev => ({ ...prev, [galleryItemId]: updatedMedia }));
            setUploadState({ uploading: false, files: [], previews: [] });
            toast.success('Đã tải ảnh minh chứng thành công!');
        } catch (err) {
            toast.error('Lỗi khi tải ảnh lên.');
        } finally {
            setUploadState(prev => ({ ...prev, uploading: false }));
        }
    };

    const handleDeleteMedia = async (mediaId: number) => {
        if (!galleryItemId) return;
        try {
            await mediaService.deleteMedia(mediaId);
            const updatedMedia = await mediaService.getMediaByExpenditureItemId(galleryItemId);
            setItemMedia(prev => ({ ...prev, [galleryItemId]: updatedMedia }));
            toast.success('Đã xóa ảnh minh chứng.');
        } catch (err) {
            toast.error('Không thể xóa ảnh.');
        }
    };

    const groupedItems = useMemo(() => {
        const groups: Record<number | string, { cat: ExpenditureCatology | null, items: any[] }> = {};
        
        // Add existing categories
        categories.forEach(cat => {
            groups[cat.id] = { cat, items: [] };
        });

        // Add items to categories
        itemsData.forEach(item => {
            const catId = item.catologyId || 'other';
            if (!groups[catId]) groups[catId] = { cat: null, items: [] };
            groups[catId].items.push({ ...item, isNew: false });
        });

        // Add unsaved new items
        updateItems.forEach(it => {
            if (it.isNew) {
                const catId = it.catologyId || 'other';
                if (!groups[catId]) groups[catId] = { cat: null, items: [] };
                groups[catId].items.push(it);
            }
        });

        return groups;
    }, [itemsData, categories, updateItems]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!expenditure || !campaign) return null;

    const renderPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.abs(n)) + ' đ';
    const renderNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
    const isItemized = campaign.type === 'ITEMIZED';

    const withdrawalCount = expenditure.evidences?.length || 0;
    const totalWithdrawn = (expenditure.evidences || []).reduce((sum, ev) => sum + Math.abs(ev.amount || 0), 0);
    const totalActualAmt = updateItems.reduce((sum, it) => sum + ((it.actualQuantity || 0) * (it.actualPrice || 0)), 0);
    const balanceRemaining = totalWithdrawn - totalActualAmt;

    const currentGalleryItem = itemsData.find(it => it.id === galleryItemId) || updateItems.find(it => it.id === galleryItemId && it.isNew);

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            {/* Header Sticky */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => router.back()} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Cập nhật Thực chi & Phát sinh</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded uppercase tracking-widest">Bước 4</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[300px]">Chiến dịch: {campaign.title}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 mt-8">
                {/* SECTION 1: WITHDRAWAL OVERVIEW */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[2px]">Tổng quan rút tiền & Chứng từ</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Số lần đã rút tiền</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900">{withdrawalCount}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">đợt</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tổng tiền đã rút</span>
                                <span className="text-3xl font-black text-emerald-600">{renderPrice(totalWithdrawn)}</span>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách các đợt rút tiền</span>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[280px]">
                                {expenditure.evidences?.map((ev, idx) => {
                                    const hasProof = !!ev.proofUrl;
                                    return (
                                        <div key={ev.id || idx} className="px-6 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 font-sans group/ev">
                                            <div className="flex items-center gap-4">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[9px]">#{idx + 1}</div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none">{renderPrice(ev.amount)}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                                        Thời gian rút: {ev.createdAt ? new Date(ev.createdAt).toLocaleString('vi-VN') : '---'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                {hasProof ? (
                                                    <a 
                                                        href={ev.proofUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <ImageIcon className="w-3.5 h-3.5" /> Xem bài viết minh chứng
                                                    </a>
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100/50">Chờ nộp chứng từ</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: ACTUAL EXPENDITURE TABLE */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[2px]">Nhập số liệu thực chi & Phát sinh</h2>
                        </div>
                        <button 
                            onClick={() => setIsAddingCategory(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <FolderPlus className="w-3.5 h-3.5" /> Thêm danh mục mới
                        </button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto font-sans">
                            <table className="w-full text-left border-collapse table-fixed lg:table-auto">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[2px] w-[280px]">Hạng mục / Minh chứng</th>
                                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[2px] w-[180px]">Link GG Map nơi mua</th>
                                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[2px] w-[150px]">Nơi mua / Hiệu</th>
                                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[2px] w-[100px]">Số lượng</th>
                                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[2px] w-[100px]">Đơn vị</th>
                                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[2px] w-[140px]">Đơn giá</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[2px] text-right w-[140px]">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedItems).map(([id, group]) => (
                                        <Fragment key={id}>
                                            <tr className="bg-slate-100/30">
                                                <td colSpan={7} className="px-6 py-2 border-y border-slate-100/50">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{group.cat?.name || (id === 'other' ? 'Hạng mục khác' : 'Danh mục mới')}</span>
                                                        <button 
                                                            onClick={() => handleAddNewItem(group.cat?.id)}
                                                            className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase hover:text-emerald-700 transition-colors"
                                                        >
                                                            <PlusCircle className="w-3 h-3" /> Thêm hạng mục
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {group.items.map((item) => {
                                                const updateItem = updateItems.find(it => it.id === item.id);
                                                const expectedQty = item.isNew ? 0 : (isItemized ? (donationSummary[item.id] || 0) : (item.expectedQuantity || 0));
                                                const expectedPrice = item.isNew ? 0 : (item.expectedPrice || 0);
                                                const actualSubtotal = (updateItem?.actualQuantity || 0) * (updateItem?.actualPrice || 0);
                                                const mediaList = itemMedia[item.id] || [];

                                                return (
                                                    <Fragment key={item.id}>
                                                        <tr className="border-b border-slate-50 hover:bg-slate-50/10 transition-colors group">
                                                            <td className="px-6 py-3 align-top">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    {item.isNew ? (
                                                                        <div className="relative flex-1">
                                                                            <input 
                                                                                className="w-full bg-amber-50/50 border border-amber-200 rounded-lg px-2 py-1 text-[11px] font-black focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none"
                                                                                placeholder="Tên hạng mục mới..."
                                                                                value={updateItem?.name || ''}
                                                                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                                            />
                                                                            <span className="absolute -top-2.5 -left-1 px-1 bg-amber-100 text-[7px] font-black text-amber-600 rounded uppercase">Phát sinh</span>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-[11px] font-black text-slate-900 leading-tight flex-1">{item.name}</p>
                                                                    )}
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        <button 
                                                                            onClick={() => setGalleryItemId(item.id)}
                                                                            disabled={item.isNew}
                                                                            className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${item.isNew ? 'opacity-20 cursor-not-allowed' : (mediaList.length > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600')}`}
                                                                        >
                                                                            <Camera className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        {item.isNew && (
                                                                            <button onClick={() => handleRemoveNewItem(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                                                                                <X className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="url"
                                                                    placeholder="Link..."
                                                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-emerald-600"
                                                                    value={updateItem?.actualPurchaseLink || ''}
                                                                    onChange={(e) => handleItemChange(item.id, 'actualPurchaseLink', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="..."
                                                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                                                    value={updateItem?.actualBrand || ''}
                                                                    onChange={(e) => handleItemChange(item.id, 'actualBrand', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-center focus:bg-white outline-none"
                                                                    value={updateItem?.actualQuantity || ''}
                                                                    onChange={(e) => handleItemChange(item.id, 'actualQuantity', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600 uppercase focus:bg-white outline-none text-center"
                                                                    value={updateItem?.unit || ''}
                                                                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                                                    placeholder="..."
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-right focus:bg-white outline-none"
                                                                    value={updateItem?.actualPrice || ''}
                                                                    onChange={(e) => handleItemChange(item.id, 'actualPrice', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <p className="text-[11px] font-black text-slate-900">{renderPrice(actualSubtotal)}</p>
                                                            </td>
                                                        </tr>

                                                        {!item.isNew && (
                                                            <tr className="bg-slate-100 border-b border-white">
                                                                <td className="px-6 py-1.5">
                                                                    <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest pl-4 shrink-0">Kế hoạch:</span>
                                                                </td>
                                                                <td colSpan={2} className="px-4 py-1.5">
                                                                    {item.expectedPurchaseLink && (
                                                                        <a href={item.expectedPurchaseLink} target="_blank" rel="noopener noreferrer" className="text-[8px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 truncate max-w-[250px]">
                                                                            <ExternalLink className="w-2 h-2" /> {item.expectedPurchaseLink}
                                                                        </a>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-1.5 text-center">
                                                                    <span className="text-[9px] font-black text-slate-900">{renderNumber(expectedQty)}</span>
                                                                </td>
                                                                <td className="px-4 py-1.5 text-center">
                                                                    <span className="text-[9px] font-black text-slate-900">{item.unit || '---'}</span>
                                                                </td>
                                                                <td className="px-4 py-1.5 text-right">
                                                                    <span className="text-[9px] font-black text-slate-900">{renderPrice(expectedPrice)}</span>
                                                                </td>
                                                                <td className="px-6 py-1.5 text-right">
                                                                    <span className="text-[9px] font-black text-slate-900">{renderPrice(expectedQty * expectedPrice)}</span>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </Fragment>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white">
                                        <td colSpan={6} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Tổng thực tế toàn chiến dịch:</td>
                                        <td className="px-6 py-4 text-right text-base font-black">{renderPrice(totalActualAmt)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: TỔNG KẾT MINH CHỨNG */}
                <div className="my-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[2px]">Bài viết minh chứng tổng</h2>
                    </div>
                    {globalProofUrl ? (
                         <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 border border-emerald-100 rounded-3xl gap-4">
                              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                   <Check className="w-6 h-6" />
                              </div>
                              <div className="text-center">
                                  <p className="text-sm text-emerald-800 font-black mb-1">Đã khởi tạo bài viết minh chứng thành công</p>
                                  <a href={globalProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center justify-center gap-1">
                                      <ExternalLink className="w-3 h-3" /> Nhấn vào đây để xem
                                  </a>
                              </div>
                              <button 
                                  onClick={() => setIsPostModalOpen(true)}
                                  className="mt-2 text-[10px] text-slate-500 hover:text-slate-900 font-black uppercase tracking-widest transition-colors flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl"
                              >
                                  Soạn lại / Đăng bài minh chứng khác
                              </button>
                         </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                             <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 flex items-center justify-center rounded-[2rem] text-slate-400 mb-6">
                                 <PlusCircle className="w-8 h-8" />
                             </div>
                             <p className="text-xs text-slate-500 font-bold mb-6 text-center max-w-md leading-relaxed">Nhấn vào đây để tạo và xuất bản một bài viết minh chứng lên bảng tin dự án, giúp người quyên góp đối soát tiện lợi hơn.</p>
                             <button 
                                 onClick={() => setIsPostModalOpen(true)}
                                 className="h-14 px-8 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-xl hover:-translate-y-0.5"
                             >
                                 <Plus className="w-5 h-5" /> Soạn bài viết minh chứng
                             </button>
                         </div>
                    )}
                </div>

            </div>

            {/* NEW CATEGORY MODAL */}
            {isAddingCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingCategory(false)} />
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl border border-white">
                        <h3 className="text-xl font-black text-slate-900 mb-2">Thêm danh mục mới</h3>
                        <p className="text-xs font-bold text-slate-400 mb-6 lowercase">Dùng để phân nhóm các hạng mục chi tiêu phát sinh.</p>
                        <input 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none mb-6 transition-all"
                            placeholder="Tên danh mục (ví dụ: Chi phí di chuyển, Ăn uống...)"
                            autoFocus
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setIsAddingCategory(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Hủy bỏ</button>
                            <button 
                                onClick={handleAddCategory}
                                disabled={!newCategoryName.trim() || isSubmitting}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-20"
                            >
                                {isSubmitting ? 'Đang tạo...' : 'Tạo danh mục'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GALLERY MODAL */}
            {galleryItemId && (
                <ExpenditureGalleryModal
                    isOpen={!!galleryItemId}
                    onClose={() => {
                        setGalleryItemId(null);
                        setUploadState({ uploading: false, files: [], previews: [] });
                    }}
                    itemName={currentGalleryItem?.name || 'Hạng mục'}
                    media={itemMedia[galleryItemId] || []}
                    onDelete={handleDeleteMedia}
                    onFileChange={handleFileChange}
                    onUploadSubmit={handleUploadSubmit}
                    uploadState={uploadState}
                />
            )}

            {/* CREATE POST MODAL */}
            {isPostModalOpen && expenditure && (
                <CreateOrEditPostModal
                    isOpen={isPostModalOpen}
                    onClose={() => { setIsPostModalOpen(false); setCurrentDraftPost(null); }}
                    campaignsList={[{ id: campaign?.id || 0, title: campaign?.title || '' }]}
                    campaignTitlesMap={{ [campaign?.id || 0]: campaign?.title || '' }}
                    initialData={currentDraftPost ? currentDraftPost : {
                        id: undefined as unknown as string,
                        author: { id: '', name: '', avatar: '' },
                        liked: false,
                        comments: [],
                        likeCount: 0,
                        replyCount: 0,
                        viewCount: 0,
                        isPinned: false,
                        isLocked: false,
                        flagged: false,
                        title: `Cập nhật minh chứng thực chi: ${campaign?.title}`,
                        content: `Tôi vừa hoàn thành đợt cập nhật thực chi cho chiến dịch "${campaign?.title}". Đây là các biên lai và hình ảnh minh chứng tổng hợp.`,
                        type: 'DISCUSSION',
                        visibility: 'PUBLIC',
                        status: 'PUBLISHED',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        targetId: expenditure.id,
                        targetType: 'EXPENDITURE',
                        targetName: 'Biên lai tổng thực chi',
                        attachments: [],
                    }}
                    draftMode={false}
                    onPostCreated={async (newPost) => {
                        if (newPost) {
                            const proofUrl = `${window.location.origin}/post/${newPost.id}`;
                            setGlobalProofUrl(proofUrl);
                            toast.success('Đã tạo bài viết minh chứng thành công! URL đã được tự động điền.');
                        }
                        setIsPostModalOpen(false);
                        setCurrentDraftPost(null);
                    }}
                    onPostUpdated={async (updatedPost) => {
                        if (updatedPost) {
                            const proofUrl = `${window.location.origin}/post/${updatedPost.id}`;
                            setGlobalProofUrl(proofUrl);
                            toast.success('Đã cập nhật bài viết thành công! URL đã được tự động điền.');
                        }
                        setIsPostModalOpen(false);
                        setCurrentDraftPost(null);
                    }}
                />
            )}
        </div>
    );
}
