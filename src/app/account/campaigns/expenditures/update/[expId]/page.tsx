'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, AlertCircle, ExternalLink, Link as LinkIcon, Loader2, Save, ShoppingCart, Receipt, Image as ImageIcon, Trash2, Plus, PlusCircle, X, ChevronRight, ChevronDown, Clock, Eye, EyeOff } from 'lucide-react';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { paymentService } from '@/services/paymentService';
import { mediaService, MediaUploadResponse } from '@/services/mediaService';
import { toast } from 'react-hot-toast';
import { Expenditure, ExpenditureItem, ExpenditureCatology } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';
import ExpenditureGalleryModal from '@/components/campaign/ExpenditureGalleryModal';
import CreateOrEditPostModal from '@/components/feed-post/CreateOrEditPostModal';

const STEPS = [
    { label: 'Tổng quan rút tiền', icon: Receipt },
    { label: 'Nhập thực chi', icon: ShoppingCart },
    { label: 'Bài viết minh chứng', icon: LinkIcon },
];

export default function UpdateExpenditureActualsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const expId = params ? Number(params.expId) : 0;
    const campaignId = searchParams ? searchParams.get('campaignId') : null;

    // Step state
    const [currentStep, setCurrentStep] = useState(0);

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
    const [itemsData, setItemsData] = useState<ExpenditureItem[]>([]);
    const [categories, setCategories] = useState<ExpenditureCatology[]>([]);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; actualPrice: number; actualBrand?: string; actualPurchaseLocation?: string; name?: string; catologyId?: number; isNew?: boolean; unit?: string }[]>([]);
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

    // New Item Dialog State
    const [showNewItemDialog, setShowNewItemDialog] = useState(false);
    const [newItemForm, setNewItemForm] = useState({ name: '', actualQuantity: 1, actualPrice: 0, actualBrand: '', actualPurchaseLocation: '', unit: 'Cái' });
    const [savingNewItem, setSavingNewItem] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

    // FeedPost Draft State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [currentDraftPost, setCurrentDraftPost] = useState<any>(null);
    // Evidence post submission state (for step 1)
    const [evidencePostTarget, setEvidencePostTarget] = useState<number | null>(null);

    // Collapsible Categories
    const [collapsedCats, setCollapsedCats] = useState<Set<number | string>>(new Set());

    // Pending Deletions (Local cache before Save)
    const [pendingDeletions, setPendingDeletions] = useState<{ categories: Set<number | string>, items: Set<number | string> }>({
        categories: new Set(),
        items: new Set()
    });

    const [showPlan, setShowPlan] = useState(true);

    // Validation Errors: { [itemId]: Set<fieldName> }
    const [fieldErrors, setFieldErrors] = useState<Record<string | number, Set<string>>>({});

    const hasError = (itemId: string | number, field: string) => fieldErrors[itemId]?.has(field);

    const clearError = (itemId: string | number, field: string) => {
        setFieldErrors(prev => {
            const copy = { ...prev };
            if (copy[itemId]) {
                const s = new Set(copy[itemId]);
                s.delete(field);
                if (s.size === 0) delete copy[itemId];
                else copy[itemId] = s;
            }
            return copy;
        });
    };

    const toggleCategory = (catId: number | string) => {
        setCollapsedCats(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

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

            setUpdateItems(prevUpdateItems => {
                // Preserve user edits for existing items; add new DB items
                const fetched = items.map(item => {
                    const existing = prevUpdateItems.find(ui => ui.id === item.id);
                    if (existing && !existing.isNew) {
                        // Keep user's current edits
                        return existing;
                    }
                    return {
                        id: item.id,
                        actualQuantity: item.actualQuantity ?? 0,
                        actualPrice: item.actualPrice ?? 0,
                        actualBrand: item.actualBrand ?? item.expectedBrand ?? '',
                        actualPurchaseLocation: (item as any).actualPurchaseLocation ?? item.expectedPurchaseLocation ?? '',
                        unit: (item as any).actualUnit ?? item.unit ?? ''
                    };
                });
                return fetched;
            });

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
                ? { ...item, [field]: (field === 'actualQuantity' || field === 'actualPrice') ? Math.abs(parseInt(String(value).replace(/[^0-9]/g, '')) || 0) : value }
                : item
        ));
        clearError(itemId, field);
    };

    // Block decimal/comma input for integer-only fields
    const blockDecimalInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    };

    const handleAddNewItem = () => {
        setNewItemForm({ name: '', actualQuantity: 1, actualPrice: 0, actualBrand: '', actualPurchaseLocation: '', unit: 'Cái' });
        setShowNewItemDialog(true);
    };

    const handleSaveNewItem = async () => {
        if (!newItemForm.name.trim()) {
            toast.error('Vui lòng nhập tên hạng mục.');
            return;
        }
        setSavingNewItem(true);
        try {
            const payload = [{
                name: newItemForm.name,
                expectedQuantity: 0,
                expectedPrice: 0,
                actualQuantity: newItemForm.actualQuantity || 1,
                actualPrice: newItemForm.actualPrice || 0,
                actualBrand: newItemForm.actualBrand || '',
                expectedBrand: newItemForm.actualBrand || '',
                actualPurchaseLocation: newItemForm.actualPurchaseLocation || '',
                expectedPurchaseLocation: newItemForm.actualPurchaseLocation || '',
                actualUnit: newItemForm.unit || 'Cái',
                expectedUnit: newItemForm.unit || 'Cái',
            }];
            await expenditureService.addItems(expId, payload as any);
            toast.success(`Đã thêm hạng mục "${newItemForm.name}"`);
            setShowNewItemDialog(false);
            await loadData(true);
        } catch (err) {
            toast.error('Không thể thêm hạng mục.');
        } finally {
            setSavingNewItem(false);
        }
    };

    const handleRemoveNewItem = (tempId: number) => {
        setUpdateItems(prev => prev.filter(it => it.id !== tempId));
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        const tempId = `temp-cat-${Date.now()}`;
        const newCat = {
            id: tempId,
            name: newCategoryName,
            description: '',
            expectedAmount: 0,
            actualAmount: 0
        } as any;
        setCategories(prev => [...prev, newCat]);
        setNewCategoryName('');
        setIsAddingCategory(false);
        toast.success(`Đã thêm danh mục tạm thời "${newCategoryName}"`);
    };

    const handleDeleteCategory = (catId: string | number) => {
        if (typeof catId === 'string' && catId.startsWith('temp-cat-')) {
            setCategories(prev => prev.filter(c => String(c.id) !== String(catId)));
            setUpdateItems(prev => prev.filter(it => it.catologyId !== catId as any));
            toast.success('Đã xóa danh mục phát sinh.');
        }
    };

    // ============ PER-STEP VALIDATION ============

    const validateStep1 = (): boolean => {
        // Step 1: Validate evidences have proofUrl (if any)
        const evidencesWithoutProof = (expenditure?.evidences || []).filter(ev => !ev.proofUrl);
        if (evidencesWithoutProof.length > 0) {
            toast.error(`Còn ${evidencesWithoutProof.length} đợt rút tiền chưa có minh chứng. Vui lòng nộp đầy đủ minh chứng trước khi tiếp tục.`);
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        // Total amount check — must match exactly (no tolerance)
        if (totalActualAmt !== totalWithdrawn) {
            toast.error(`Tổng chi thực tế (${renderNumber(totalActualAmt)} đ) phải khớp với tổng tiền đã giải ngân (${renderNumber(totalWithdrawn)} đ). Chênh lệch: ${renderNumber(Math.abs(totalActualAmt - totalWithdrawn))} đ.`);
            return false;
        }

        // Mandatory Field Validation
        const errors: Record<string | number, Set<string>> = {};
        let errorCount = 0;
        for (const item of activeItems) {
            const ui = updateItems.find(it => it.id === item.id);
            if (!ui) continue;
            const errs = new Set<string>();
            if (ui.actualQuantity === undefined || ui.actualQuantity < 0) errs.add('actualQuantity');
            if (!ui.unit || !ui.unit.trim()) errs.add('unit');
            if (ui.actualPrice === undefined || ui.actualPrice < 0) errs.add('actualPrice');
            if (!ui.actualBrand || !ui.actualBrand.trim()) errs.add('actualBrand');
            if (errs.size > 0) {
                errors[item.id] = errs;
                errorCount += errs.size;
            }
        }
        if (errorCount > 0) {
            setFieldErrors(errors);
            toast.error(`Còn ${errorCount} trường bắt buộc chưa được điền. Vui lòng kiểm tra các ô viền đỏ.`);
            return false;
        }
        setFieldErrors({});
        return true;
    };

    const validateStep3 = (): boolean => {
        if (!globalProofUrl) {
            toast.error('Vui lòng soạn bài viết minh chứng trước khi hoàn tất.');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 0 && !validateStep1()) return;
        if (currentStep === 1 && !validateStep2()) return;
        setCurrentStep(prev => Math.min(prev + 1, 2));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (!validateStep3()) return;

        toast((t) => (
            <div className="flex flex-col gap-3 p-1 max-w-sm">
                <p className="text-xs font-black text-amber-800 uppercase tracking-widest">⚠️ Lưu ý quan trọng</p>
                <p className="text-[11px] font-bold text-slate-700 leading-relaxed">Sau khi lưu, toàn bộ minh chứng sẽ chuyển sang <strong>&quot;Đã nộp&quot;</strong> và đợt chi tiêu này sẽ <strong>được đánh dấu hoàn tất</strong>. Bạn sẽ không thể chỉnh sửa lại.</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { toast.dismiss(t.id); doSubmit(); }}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700"
                    >
                        Xác nhận lưu
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-1.5 bg-slate-100 text-black rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        ), { duration: 15000, position: 'top-center', style: { borderRadius: '16px', border: '2px solid #f59e0b', background: '#fffbeb', maxWidth: '420px' } });
    };

    const doSubmit = async () => {
        try {
            setIsSubmitting(true);

            // If evidence status is ALLOWED_EDIT, it means we are resubmitting a completed expenditure.
            // We need to momentarily set status to PROCESSING so updateActuals can succeed if the backend blocks COMPLETED ones.
            if (expenditure?.evidenceStatus === 'ALLOWED_EDIT') {
                await expenditureService.updateStatus(expId, 'PROCESSING');
            }

            for (const catId of Array.from(pendingDeletions.categories)) {
                await expenditureService.deleteCategory(catId as number);
            }

            const newCats = categories.filter(c => c.id.toString().startsWith('temp-cat-'));
            const catIdMap: Record<string, number> = {};

            for (const cat of newCats) {
                const created = await expenditureService.createCategory(expId, cat.name);
                catIdMap[cat.id.toString()] = created.id;
            }

            const finalUpdateItems = updateItems.map(it => {
                const tempCatId = it.catologyId?.toString();
                if (tempCatId && catIdMap[tempCatId]) {
                    return { ...it, catologyId: catIdMap[tempCatId] };
                }
                return it;
            });

            const newItemsToCreate = finalUpdateItems.filter(it => it.isNew && it.name);
            const itemsToUpdate = finalUpdateItems.filter(it => !it.isNew);

            if (newItemsToCreate.length > 0) {
                const payload = newItemsToCreate.map(it => ({
                    name: it.name || 'Hạng mục mới',
                    catologyId: it.catologyId,
                    expectedQuantity: 0,
                    expectedPrice: 0,
                    actualQuantity: it.actualQuantity,
                    actualPrice: it.actualPrice,
                    actualBrand: it.actualBrand,
                    actualPurchaseLocation: it.actualPurchaseLocation,
                    actualUnit: it.unit || 'Cái',
                    expectedUnit: it.unit || 'Cái',
                }));
                await expenditureService.addItems(expId, payload as any);
            }

            const itemsToUpdatePayload = itemsToUpdate.map(it => ({
                id: it.id,
                actualQuantity: it.actualQuantity,
                actualPrice: it.actualPrice,
                actualBrand: it.actualBrand,
                actualPurchaseLocation: it.actualPurchaseLocation,
                actualUnit: it.unit
            }));
            await expenditureService.updateActuals(expId, itemsToUpdatePayload as any, globalProofUrl);

            await expenditureService.updateEvidenceStatus(expId, 'SUBMITTED');
            await expenditureService.updateStatus(expId, 'COMPLETED');

            toast.success('Nộp minh chứng thành công!');
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

    const [isImporting, setIsImporting] = useState(false);
    const handleImportActuals = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        try {
            const res = await expenditureService.importItemsFromExcel(file);
            if (res.success && res.data) {
                const imported = res.data;
                setUpdateItems(prevItems => {
                    return prevItems.map(item => {
                        const match = imported.find(imp => imp.name === item.name);
                        if (match) {
                            return {
                                ...item,
                                actualQuantity: match.actualQuantity ?? item.actualQuantity,
                                actualPrice: match.actualPrice ?? item.actualPrice,
                                actualBrand: match.actualBrand ?? item.actualBrand,
                                actualPurchaseLocation: match.actualPurchaseLocation ?? item.actualPurchaseLocation,
                                unit: match.expectedUnit ?? item.unit
                            };
                        }
                        return item;
                    });
                });
                toast.success(`Đã cập nhật ${imported.length} hạng mục từ Excel`);
            } else {
                toast.error(res.error || 'Lỗi khi nhập file');
            }
        } catch (err) {
            toast.error('Lỗi hệ thống khi xử lý file');
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const groupedItems = useMemo(() => {
        const groups: Record<number | string, { cat: ExpenditureCatology | null, items: any[] }> = {};

        const activeCategories = categories.filter(c => !pendingDeletions.categories.has(c.id));
        activeCategories.forEach(cat => {
            groups[cat.id] = { cat, items: [] };
        });

        itemsData.forEach(item => {
            const catId = item.catologyId || 'other';
            if (!groups[catId]) groups[catId] = { cat: null, items: [] };
            groups[catId].items.push({ ...item, isNew: false });
        });

        if (!groups['other']) groups['other'] = { cat: null, items: [] };
        updateItems.filter(it => it.isNew).forEach(it => {
            groups['other'].items.push(it);
        });

        return groups;
    }, [itemsData, categories, updateItems]);

    const activeItems = useMemo(() => {
        return updateItems.filter(it => {
            if (it.catologyId && pendingDeletions.categories.has(it.catologyId)) return false;
            return true;
        });
    }, [updateItems, pendingDeletions]);

    // Helpers & Derived Data
    const renderPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.abs(n)) + ' VNĐ';
    const renderNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    const payoutTransactions = (expenditure?.transactions || []).filter(t => t.type === 'PAYOUT' && t.status === 'COMPLETED');
    const withdrawalCount = payoutTransactions.length;
    // Tổng tiền đã rút: ưu tiên evidences (giao dịch ngân hàng thật), fallback sang PAYOUT transactions
    const evidenceTotal = (expenditure?.evidences || []).reduce((sum, ev) => sum + Math.abs(ev.amount || 0), 0);
    const payoutTotal = payoutTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalWithdrawn = evidenceTotal > 0 ? evidenceTotal : payoutTotal;

    const totalActualAmt = activeItems.reduce((sum, it) => sum + ((it.actualQuantity || 0) * (it.actualPrice || 0)), 0);
    const balanceRemaining = totalWithdrawn - totalActualAmt;
    const isItemized = campaign?.type === 'ITEMIZED';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm font-black text-black uppercase tracking-widest">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!expenditure || !campaign) return null;

    // Block editing when evidence_status is SUBMITTED or APPROVED (not ALLOWED_EDIT)
    const isEvidenceLocked = expenditure.evidenceStatus === 'SUBMITTED' || expenditure.evidenceStatus === 'APPROVED';

    if (isEvidenceLocked) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-10 text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                            {expenditure.evidenceStatus === 'SUBMITTED' ? 'Minh chứng đã được nộp' : 'Minh chứng đã được xác nhận'}
                        </h2>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed">
                            {expenditure.evidenceStatus === 'SUBMITTED'
                                ? 'Đợt chi tiêu này đã nộp minh chứng. Bạn không thể chỉnh sửa thông tin thực chi cho đến khi quản trị viên yêu cầu chỉnh sửa lại.'
                                : 'Đợt chi tiêu này đã được quản trị viên xác nhận. Không thể chỉnh sửa nữa.'}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/account/campaigns/expenditures?campaignId=${campaign?.id}`)}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại trang chi tiêu
                    </button>
                </div>
            </div>
        );
    }

    const currentGalleryItem = itemsData.find(it => it.id === galleryItemId) || updateItems.find(it => it.id === galleryItemId && it.isNew);

    // ============ STEP RENDERERS ============

    const renderStep1 = () => (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-1 space-y-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Số giao dịch</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{(expenditure?.evidences || []).length}</span>
                            <span className="text-xs font-bold text-black uppercase tracking-widest">giao dịch</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Tổng tiền giao dịch</span>
                        <span className="text-3xl font-black text-emerald-600">{renderPrice((expenditure?.evidences || []).reduce((sum, ev) => sum + Math.abs(ev.amount || 0), 0))}</span>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Giao dịch cần nộp minh chứng</span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[280px]">
                        {(expenditure?.evidences || []).length === 0 ? (
                            <div className="px-6 py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Không có giao dịch nào cần nộp minh chứng
                            </div>
                        ) : (expenditure?.evidences || []).map((ev, idx) => {
                            const hasProof = !!ev.proofUrl;
                            const isOverdue = ev.dueAt && new Date(ev.dueAt) < new Date();
                            return (
                                <div key={ev.id || idx} className="px-6 py-2.5 flex items-center justify-between hover:bg-slate-50/30 transition-colors border-b border-slate-50 last:border-0 font-sans">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px] ${hasProof ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-rose-200 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>#{idx + 1}</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-none">{renderPrice(ev.amount)}</p>
                                            <p className="text-[10px] font-bold text-black uppercase tracking-tighter mt-1">
                                                {ev.createdAt ? new Date(ev.createdAt).toLocaleString('vi-VN') : '---'}
                                            </p>
                                            {ev.dueAt && !hasProof && (
                                                <p className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                                                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                                                    Hạn nộp: {new Date(ev.dueAt).toLocaleString('vi-VN')}
                                                    {isOverdue && ' (QUÁ HẠN)'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {hasProof ? (
                                            <a href={ev.proofUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                                <ImageIcon className="w-3.5 h-3.5" /> Xem minh chứng
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEvidencePostTarget(ev.id);
                                                    setCurrentDraftPost({
                                                        title: `Minh chứng giao dịch: ${campaign?.title}`,
                                                        content: `Tôi vừa hoàn thành thực hiện chi tiêu cho chiến dịch "${campaign?.title}".\nSố tiền: ${renderPrice(ev.amount)}\nNgày thực hiện: ${ev.createdAt ? new Date(ev.createdAt).toLocaleDateString('vi-VN') : '---'}\n\n#MinhChungChiTieu #TrustFundMe`,
                                                        targetId: expenditure?.id,
                                                        targetType: 'EXPENDITURE',
                                                        targetName: `evidence|${ev.id}`,
                                                        _evidenceId: ev.id,
                                                        type: 'DISCUSSION',
                                                        visibility: 'PUBLIC',
                                                        status: 'PUBLISHED',
                                                        attachments: [],
                                                    });
                                                    setIsPostModalOpen(true);
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer hover:shadow-md transition-all ${isOverdue ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100/50 hover:bg-amber-100'}`}
                                            >
                                                <PlusCircle className="w-3 h-3 inline mr-1" />
                                                {isOverdue ? 'Nộp minh chứng (quá hạn)' : 'Nộp minh chứng'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div>
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Chi tiết thực tế</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật hạng mục và minh chứng</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowPlan(!showPlan)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all border shadow-sm ${showPlan ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                    {showPlan ? (
                        <><EyeOff className="w-3.5 h-3.5" /> Ẩn kế hoạch</>
                    ) : (
                        <><Eye className="w-3.5 h-3.5" /> Hiện kế hoạch</>
                    )}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto font-sans">
                    <table className="w-full text-left border-collapse table-fixed lg:table-auto border border-slate-200">
                        <thead>
                            <tr className="bg-[#f8fafc] border-b border-slate-200">
                                <th className="px-2 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[50px] border border-slate-200">STT</th>
                                <th className="px-3 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[150px] border border-slate-200">Tên danh mục</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[240px] border border-slate-200">Tên hạng mục</th>
                                <th className="px-2 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[140px] border border-slate-200">Nơi mua</th>
                                <th className="px-2 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[140px] border border-slate-200">Hiệu</th>
                                <th className="px-2 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[85px] border border-slate-200">Số lượng</th>
                                <th className="px-2 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[85px] border border-slate-200">Đơn vị</th>
                                <th className="px-2 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[120px] border border-slate-200">Đơn giá</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center w-[140px] border border-slate-200">Thành tiền</th>
                                <th className="px-1 py-3 text-[10px] font-black text-slate-700 uppercase tracking-[2px] text-center w-[90px] border border-slate-200">Ảnh minh chứng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let globalIdx = 1;
                                return Object.entries(groupedItems).map(([id, group]) => {
                                    if (collapsedCats.has(id)) {
                                        return (
                                            <tr key={id} className="bg-slate-50 border border-slate-200 cursor-pointer" onClick={() => toggleCategory(id)}>
                                                <td colSpan={10} className="px-4 py-3 text-[10px] font-black text-slate-400 border border-slate-200 uppercase text-center">
                                                    Danh mục: {group.cat?.name || 'Hạng mục phát sinh'} (Đang ẩn - Bấm để hiện)
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // Pre-calculate group rowspan
                                    const groupRowSpan = group.items.reduce((acc, it) => {
                                        const hasPlanLocal = !it.isNew && (it.expectedQuantity > 0 || it.expectedPrice > 0);
                                        return acc + (showPlan && hasPlanLocal ? 2 : 1);
                                    }, 0);

                                    // Show "add item" row if group is empty and it's the 'other' group
                                    if (group.items.length === 0 && id === 'other') {
                                        return (
                                            <tr key="add-item-row" className="border-b border-slate-200">
                                                <td colSpan={10} className="px-6 py-4 text-center border border-slate-200">
                                                    <button
                                                        onClick={handleAddNewItem}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
                                                    >
                                                        <PlusCircle className="w-3.5 h-3.5" /> Thêm hạng mục phát sinh
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return group.items.map((item) => {
                                        const updateItem = updateItems.find(it => it.id === item.id);
                                        const actualSubtotal = (updateItem?.actualQuantity || 0) * (updateItem?.actualPrice || 0);
                                        const mediaList = itemMedia[item.id] || [];
                                        const hasPlan = !item.isNew && (item.expectedQuantity > 0 || item.expectedPrice > 0);
                                        const itemRowSpan = (showPlan && hasPlan) ? 2 : 1;

                                        // Plan values
                                        const expectedQty = item.isNew ? 0 : (isItemized ? (donationSummary[item.id] || 0) : (item.expectedQuantity || 0));
                                        const expectedPrice = item.isNew ? 0 : (item.expectedPrice || 0);
                                        const currentIdx = globalIdx++;

                                        return (
                                            <Fragment key={item.id}>
                                                {/* ACTUAL ROW */}
                                                <tr className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors group">
                                                    {/* STT */}
                                                    <td rowSpan={itemRowSpan} className="px-2 py-2 text-center text-[11px] font-black text-slate-400 border border-slate-200 bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.1)]">
                                                        {currentIdx}
                                                    </td>

                                                    {/* Category Column */}
                                                    {group.items.indexOf(item) === 0 && (
                                                        <td rowSpan={groupRowSpan} className="px-3 py-2 text-center align-middle border border-slate-200 bg-white min-w-[120px]">
                                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight">
                                                                {group.cat?.name || (id === 'other' ? 'Hạng mục phát sinh' : 'Danh mục mới')}
                                                            </p>
                                                            {id === 'other' && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleAddNewItem(); }}
                                                                    className="mt-1 flex items-center justify-center gap-1 text-[8px] font-black text-amber-600 uppercase hover:text-amber-700 transition-colors mx-auto p-1 px-2 border border-amber-100 rounded-md bg-amber-50/50"
                                                                >
                                                                    <PlusCircle className="w-2.5 h-2.5" /> Thêm hạng mục
                                                                </button>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* Name */}
                                                    <td className="px-4 py-1.5 border border-slate-200 bg-white text-center">
                                                        <div className="flex flex-col items-center gap-0.5 py-0">
                                                            {item.isNew ? (
                                                                <div className="relative w-full">
                                                                    <input
                                                                        className="w-full bg-amber-50/50 border border-amber-100 rounded-md px-2 py-0.5 text-[12px] font-black focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none"
                                                                        placeholder="Tên hạng mục..."
                                                                        value={updateItem?.name || ''}
                                                                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <p className="text-[12px] font-black text-slate-900 leading-[1.2]">{item.name}</p>
                                                            )}

                                                            {showPlan && (
                                                                <span className="text-[7px] font-black text-white bg-emerald-500 px-1 py-0.5 rounded-[3px] uppercase tracking-[0.5px]">THỰC TẾ</span>
                                                            )}
                                                        </div>
                                                    </td>


                                                    {/* Purchase Location */}
                                                    <td className="px-2 py-1.5 border border-slate-200 bg-white text-center">
                                                        <input type="text"
                                                            className="w-full h-7 px-2 bg-transparent text-[11px] font-bold text-slate-600 text-center focus:bg-white transition-all outline-none"
                                                            value={updateItem?.actualPurchaseLocation ?? ''}
                                                            onChange={(e) => handleItemChange(item.id, 'actualPurchaseLocation', e.target.value)}
                                                        />
                                                    </td>

                                                    {/* Brand */}
                                                    <td className="px-2 py-1.5 border border-slate-200 bg-white text-center">
                                                        <input type="text"
                                                            className="w-full h-7 px-2 bg-transparent text-[11px] font-bold text-slate-600 text-center focus:bg-white transition-all outline-none"
                                                            value={updateItem?.actualBrand || ''}
                                                            onChange={(e) => handleItemChange(item.id, 'actualBrand', e.target.value)}
                                                        />
                                                    </td>

                                                    {/* Quantity */}
                                                    <td className="px-2 py-1.5 border border-slate-200 bg-white">
                                                        <input type="number"
                                                            className="w-full h-7 px-2 bg-transparent text-[12px] font-black text-center focus:bg-white outline-none transition-all"
                                                            value={updateItem?.actualQuantity ?? ''}
                                                            onChange={(e) => handleItemChange(item.id, 'actualQuantity', e.target.value)}
                                                        />
                                                    </td>

                                                    {/* Unit */}
                                                    <td className="px-2 py-1.5 border border-slate-200 bg-white">
                                                        <input type="text"
                                                            className="w-full h-7 px-2 bg-transparent text-[10px] font-bold text-center uppercase focus:bg-white outline-none transition-all"
                                                            value={updateItem?.unit || ''}
                                                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                                        />
                                                    </td>

                                                    {/* Price */}
                                                    <td className="px-2 py-1.5 border border-slate-200 bg-white text-center">
                                                        <input type="number"
                                                            className="w-full h-7 px-2 bg-transparent text-[12px] font-black text-center focus:bg-white outline-none transition-all"
                                                            value={updateItem?.actualPrice ?? ''}
                                                            onChange={(e) => handleItemChange(item.id, 'actualPrice', e.target.value)}
                                                        />
                                                    </td>

                                                    {/* Subtotal */}
                                                    <td className="px-4 py-1.5 text-center border border-slate-200 bg-[#f8fafc]/50">
                                                        <p className="text-[12px] font-black text-emerald-600">{renderPrice(actualSubtotal)}</p>
                                                    </td>

                                                    {/* Action / Ảnh minh chứng */}
                                                    <td rowSpan={itemRowSpan} className="px-1 border border-slate-200 text-center bg-white">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => setGalleryItemId(item.id)}
                                                                className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${mediaList.length > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-emerald-600'}`}
                                                                title="Xem ảnh minh chứng"
                                                            >
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                            {(item.isNew || (item.expectedQuantity === 0 && item.expectedPrice === 0)) && (
                                                                <button
                                                                    onClick={() => {
                                                                        toast((t) => (
                                                                            <div className="flex flex-col gap-2 p-1">
                                                                                <p className="text-[10px] font-black text-black uppercase tracking-widest">Xóa hạng mục?</p>
                                                                                <div className="flex items-center gap-2">
                                                                                    <button onClick={async () => {
                                                                                        toast.dismiss(t.id);
                                                                                        setDeletingItemId(item.id);
                                                                                        try {
                                                                                            await expenditureService.deleteItem(item.id);
                                                                                            toast.success('Đã xóa.');
                                                                                            await loadData(true);
                                                                                        } catch (err) {
                                                                                            toast.error('Lỗi khi xóa.');
                                                                                        } finally {
                                                                                            setDeletingItemId(null);
                                                                                        }
                                                                                    }} className="px-3 py-1 bg-rose-500 text-white rounded text-[8px] font-black uppercase">Xóa</button>
                                                                                    <button onClick={() => toast.dismiss(t.id)} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[8px] font-black uppercase">Hủy</button>
                                                                                </div>
                                                                            </div>
                                                                        ), { duration: 4000, position: 'top-center' });
                                                                    }}
                                                                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors border border-transparent hover:border-rose-100 rounded-lg"
                                                                    title="Xóa hạng mục"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* PLAN ROW */}
                                                {(showPlan && hasPlan) && (
                                                    <tr className="bg-slate-50/50 border-b border-slate-200">
                                                        <td className="px-4 py-1.5 border border-slate-200 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-[11px] font-bold text-slate-500 italic leading-[1.2]">{item.name}</span>
                                                                <span className="text-[7px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded-[4px] uppercase tracking-[0.5px]">KẾ HOẠCH</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5 border border-slate-200 text-center"><span className="text-[10px] font-bold text-slate-400">{item.expectedPurchaseLocation || '---'}</span></td>
                                                        <td className="px-2 py-1.5 border border-slate-200 text-center"><span className="text-[10px] font-bold text-slate-400">{item.expectedBrand || '---'}</span></td>
                                                        <td className="px-2 py-1.5 border border-slate-200 text-center"><span className="text-[11px] font-black text-slate-500">{renderNumber(expectedQty)}</span></td>
                                                        <td className="px-2 py-1.5 border border-slate-200 text-center"><span className="text-[10px] font-bold text-slate-400 uppercase">{item.expectedUnit || item.unit || '---'}</span></td>
                                                        <td className="px-2 py-1.5 border border-slate-200 text-center"><span className="text-[11px] font-black text-slate-500">{renderPrice(expectedPrice)}</span></td>
                                                        <td className="px-4 py-1.5 border border-slate-200 text-center"><span className="text-[11px] font-black text-slate-500">{renderPrice(expectedQty * expectedPrice)}</span></td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    });
                                });
                            })()}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white border border-slate-900">
                                <td colSpan={8} className="px-6 py-3 text-xs font-black uppercase tracking-[2px] text-right">Tổng thực tế toàn chiến dịch:</td>
                                <td colSpan={2} className="px-4 py-3 text-right text-lg font-black bg-slate-800 border-l border-slate-700">{renderPrice(totalActualAmt)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                    <LinkIcon className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-black uppercase tracking-[2px]">Bài viết minh chứng tổng</h2>
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
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 flex items-center justify-center rounded-2xl text-black mb-6">
                        <PlusCircle className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-black font-bold mb-6 text-center max-w-md leading-relaxed">Nhấn vào đây để tạo và xuất bản một bài viết minh chứng lên bảng tin dự án, giúp người quyên góp đối soát tiện lợi hơn.</p>
                    <button
                        onClick={() => setIsPostModalOpen(true)}
                        className="h-14 px-8 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" /> Soạn bài viết minh chứng
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">
            {/* Header Sticky */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-2.5 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => router.back()} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100">
                            <ArrowLeft className="w-5 h-5 text-black" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">{expenditure.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-black uppercase tracking-widest truncate max-w-[500px]">Chiến dịch: {campaign.title}</span>
                                {expenditure.evidenceDueAt && (
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${new Date(expenditure.evidenceDueAt) < new Date() ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <Clock className="w-2.5 h-2.5" />
                                        Hạn nộp: {new Date(expenditure.evidenceDueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="px-6 py-3 text-[10px] font-black text-black uppercase tracking-widest hover:text-emerald-600 transition-colors">
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 mt-4">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {STEPS.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;
                        return (
                            <Fragment key={idx}>
                                {idx > 0 && (
                                    <div className={`w-12 h-0.5 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                )}
                                <button
                                    onClick={() => {
                                        // Allow going back, validate going forward
                                        if (idx < currentStep) setCurrentStep(idx);
                                        else if (idx === currentStep + 1) handleNextStep();
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isActive ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' : isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}
                                >
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">Bước {idx + 1}: {step.label}</span>
                                    <span className="sm:hidden">{idx + 1}</span>
                                </button>
                            </Fragment>
                        );
                    })}
                </div>

                {/* Step Content */}
                {currentStep === 0 && renderStep1()}
                {currentStep === 1 && renderStep2()}
                {currentStep === 2 && renderStep3()}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <div>
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrevStep}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" /> Quay lại
                            </button>
                        )}
                    </div>
                    <div>
                        {currentStep < 2 ? (
                            <button
                                onClick={handleNextStep}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                            >
                                Tiếp theo <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Hoàn tất & Nộp
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* New Item Dialog */}
            {showNewItemDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Thêm hạng mục phát sinh</h3>
                            <button onClick={() => setShowNewItemDialog(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="px-6 py-4 space-y-3">
                            <div>
                                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Tên hạng mục *</label>
                                <input type="text" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-emerald-500 outline-none" placeholder="VD: Gạo, Nước mắm..." value={newItemForm.name} onChange={e => setNewItemForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Số lượng</label>
                                    <input type="number" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-center focus:bg-white focus:border-emerald-500 outline-none" value={newItemForm.actualQuantity} onChange={e => setNewItemForm(f => ({ ...f, actualQuantity: Math.abs(Number(e.target.value)) }))} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Đơn vị</label>
                                    <input type="text" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase text-center focus:bg-white focus:border-emerald-500 outline-none" value={newItemForm.unit} onChange={e => setNewItemForm(f => ({ ...f, unit: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Đơn giá (VNĐ)</label>
                                <input type="number" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-600 text-right focus:bg-white focus:border-emerald-500 outline-none" value={newItemForm.actualPrice} onChange={e => setNewItemForm(f => ({ ...f, actualPrice: Math.abs(Number(e.target.value)) }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Hiệu</label>
                                    <input type="text" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-emerald-500 outline-none" value={newItemForm.actualBrand} onChange={e => setNewItemForm(f => ({ ...f, actualBrand: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Nơi mua</label>
                                    <input type="text" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-emerald-500 outline-none" value={newItemForm.actualPurchaseLocation} onChange={e => setNewItemForm(f => ({ ...f, actualPurchaseLocation: e.target.value }))} />
                                </div>
                            </div>
                            <div className="pt-2 bg-slate-50 -mx-6 px-6 py-3 rounded-b-2xl border-t border-slate-100 text-right">
                                <p className="text-xs font-black text-slate-600 mb-3">Thành tiền: <span className="text-emerald-600">{renderPrice(newItemForm.actualQuantity * newItemForm.actualPrice)}</span></p>
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => setShowNewItemDialog(false)} className="px-4 py-2 text-[10px] font-black text-black uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-colors">Hủy</button>
                                    <button onClick={handleSaveNewItem} disabled={savingNewItem} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                                        {savingNewItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                        Tạo hạng mục
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            {isPostModalOpen && expenditure && (
                <CreateOrEditPostModal
                    isOpen={isPostModalOpen}
                    onClose={() => { setIsPostModalOpen(false); setCurrentDraftPost(null); setEvidencePostTarget(null); }}
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
                        targetName: 'evidence',
                        attachments: [],
                    }}
                    draftMode={false}
                    onPostCreated={async (newPost) => {
                        if (newPost) {
                            const proofUrl = `/post/${newPost.id}`;
                            // Check if this is an evidence submission (step 1) or global proof (step 3)
                            if (evidencePostTarget) {
                                try {
                                    await expenditureService.submitEvidence(evidencePostTarget, proofUrl);
                                    toast.success('Đã nộp minh chứng thành công!');
                                    await loadData(true); // Reload to update evidence status
                                } catch (err) {
                                    console.error('Failed to submit evidence:', err);
                                    toast.error('Lỗi khi nộp minh chứng.');
                                }
                            } else {
                                setGlobalProofUrl(proofUrl);
                                try {
                                    await expenditureService.updateActuals(expId, [], proofUrl);
                                } catch (err) {
                                    console.error('Failed to save proof URL:', err);
                                }
                                toast.success('Đã đăng bài minh chứng thành công!');
                            }
                        }
                        setIsPostModalOpen(false);
                        setCurrentDraftPost(null);
                        setEvidencePostTarget(null);
                    }}
                    onPostUpdated={async (updatedPost) => {
                        if (updatedPost) {
                            const proofUrl = `/post/${updatedPost.id}`;
                            if (evidencePostTarget) {
                                try {
                                    await expenditureService.submitEvidence(evidencePostTarget, proofUrl);
                                    toast.success('Đã nộp minh chứng thành công!');
                                    await loadData(true);
                                } catch (err) {
                                    console.error('Failed to submit evidence:', err);
                                    toast.error('Lỗi khi nộp minh chứng.');
                                }
                            } else {
                                setGlobalProofUrl(proofUrl);
                                try {
                                    await expenditureService.updateActuals(expId, [], proofUrl);
                                } catch (err) {
                                    console.error('Failed to save proof URL:', err);
                                }
                                toast.success('Đã đăng bài minh chứng thành công!');
                            }
                        }
                        setIsPostModalOpen(false);
                        setCurrentDraftPost(null);
                        setEvidencePostTarget(null);
                    }}
                />
            )}
        </div>
    );
}
