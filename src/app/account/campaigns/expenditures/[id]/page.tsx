'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { mediaService } from '@/services/mediaService';
import { paymentService } from '@/services/paymentService';
import { feedPostService } from '@/services/feedPostService';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { ArrowLeft, Calendar, FileText, CheckCircle, AlertCircle, Clock, Receipt, Image as ImageIcon, Upload, ChevronDown, ShieldCheck, Download } from 'lucide-react';
import type { MediaUploadResponse } from '@/services/mediaService';
import { toast } from 'react-hot-toast';
import ImageZoomModal from '@/components/feed-post/ImageZoomModal';
import ExpenditureItemGallery from '@/components/campaign/ExpenditureItemGallery';
import ExpenditureGalleryModal from '@/components/campaign/ExpenditureGalleryModal';

export default function ExpenditureDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = (params?.id as string);
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
    const [campaign, setCampaign] = useState<any | null>(null);
    const [items, setItems] = useState<ExpenditureItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [posts, setPosts] = useState<any[]>([]);

    // Modal State
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; price: number; }[]>([]);
    const [updating, setUpdating] = useState(false);
    const [pendingDeleteMediaIds, setPendingDeleteMediaIds] = useState<number[]>([]);

    // Item media state
    const [itemMedia, setItemMedia] = useState<Record<number, MediaUploadResponse[]>>({});
    const [itemMediaLoading, setItemMediaLoading] = useState<Record<number, boolean>>({});
    const [itemUploadState, setItemUploadState] = useState<Record<number, { uploading: boolean; files: File[]; previews: string[] }>>({});
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
    const [galleryModalItemId, setGalleryModalItemId] = useState<number | null>(null);

    // Gallery modal state
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState<{ url: string; alt?: string }[]>([]);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const [donationSummary, setDonationSummary] = useState<Record<number, number>>({});
    const [loadingDonationSummary, setLoadingDonationSummary] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const expData = await expenditureService.getById(id);
                setExpenditure(expData);

                // Fetch campaign details
                if (expData && expData.campaignId) {
                    const campaignData = await campaignService.getById(expData.campaignId);
                    setCampaign(campaignData);
                }

                const itemsData = await expenditureService.getItems(id);
                const safeItems = Array.isArray(itemsData) ? itemsData : [];
                setItems(safeItems);

                // Initialize update items
                setUpdateItems(safeItems.map(item => ({
                    id: item.id,
                    actualQuantity: item.actualQuantity || 0,
                    price: item.price || 0
                })));

                // Fetch donation summary for ITEMIZED
                if (expData.campaignId) {
                    const campaignDataVal = campaign || await campaignService.getById(expData.campaignId);
                    if (campaignDataVal?.type === 'ITEMIZED' && safeItems.length > 0) {
                        const itemIds = safeItems.map(i => i.id);
                        setLoadingDonationSummary(true);
                        try {
                            const summary = await paymentService.getDonationSummary(itemIds);
                            const map: Record<number, number> = {};
                            summary.forEach(s => { map[s.expenditureItemId] = s.donatedQuantity; });
                            setDonationSummary(map);
                        } catch (err) {
                            console.error('Failed to load donation summary:', err);
                        } finally {
                            setLoadingDonationSummary(false);
                        }
                    }
                }

                // Fetch posts
                try {
                    const postData = await feedPostService.getByTarget(Number(id), 'EXPENDITURE');
                    setPosts(postData || []);
                } catch (postErr) {
                    console.error('Failed to load posts:', postErr);
                }
            } catch (err) {
                console.error('Không thể tải chi tiết khoản chi:', err);
                setError('Không thể tải chi tiết khoản chi.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated, authLoading, router]);

    const handleOpenUpdateModal = () => {
        if (items.length > 0) {
            setUpdateItems(items.map(item => ({
                id: item.id,
                actualQuantity: item.actualQuantity !== undefined ? item.actualQuantity : 0,
                price: item.price !== undefined ? item.price : 0
            })));
            // Clear any pending deletes from previous opens
            setPendingDeleteMediaIds([]);
            // Load media for all items
            items.forEach(item => loadItemMedia(item.id));
        }
        setIsUpdateModalOpen(true);
    };

    const handleExportItems = async () => {
        import('xlsx').then((XLSX) => {
            const isAuthorized = campaign?.type === 'AUTHORIZED';
            const rows = items.map((item, idx) => {
                const planAmt = (item.quantity || 0) * (item.expectedPrice || 0);
                const receivedAmt = (donationSummary[item.id] || 0) * (item.expectedPrice || 0);
                const actualAmt = (item.actualQuantity || 0) * (item.price || 0);
                return [
                    idx + 1,
                    item.category || '',
                    isAuthorized
                        ? planAmt
                        : receivedAmt,
                    isAuthorized
                        ? actualAmt
                        : actualAmt,
                ];
            });

            const headers = isAuthorized
                ? ['STT', 'Tên hàng hóa', 'Kế hoạch (VNĐ)', 'Thực tế đã chi (VNĐ)']
                : ['STT', 'Tên hàng hóa', 'Đã nhận (VNĐ)', 'Đã chi (VNĐ)'];

            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            ws['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 20 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Chi tiêu');
            const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '');
            XLSX.writeFile(wb, `HangMucChi_${today}.xlsx`);
        });
    };

    const handleUpdateItemChange = (index: number, field: 'actualQuantity' | 'price', value: string) => {
        const newItems = [...updateItems];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setUpdateItems(newItems);
    };

    const handleUpdateSubmit = async () => {
        try {
            setUpdating(true);

            // 1. Process pending deletions
            if (pendingDeleteMediaIds.length > 0) {
                try {
                    await Promise.all(pendingDeleteMediaIds.map(id => mediaService.deleteMedia(id)));
                    setPendingDeleteMediaIds([]);
                } catch (delErr) {
                    console.error('Some media deletions failed during update:', delErr);
                }
            }

            // 2. Update actuals
            await expenditureService.updateActuals(id, updateItems);

            // Refresh data
            const expData = await expenditureService.getById(id);
            setExpenditure(expData);
            const itemsData = await expenditureService.getItems(id);
            setItems(Array.isArray(itemsData) ? itemsData : []);

            setIsUpdateModalOpen(false);
            toast.success('Cập nhật thành công!');
        } catch (err) {
            console.error('Cập nhật thất bại:', err);
            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1.5" /> Đã duyệt</span>;
            case 'PENDING':
            case 'PENDING_REVIEW':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Clock className="w-4 h-4 mr-1.5" /> Chờ duyệt</span>;
            case 'CLOSED':
            case 'WITHDRAWAL_REQUESTED':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"><Clock className="w-4 h-4 mr-1.5" /> Yêu cầu rút tiền</span>;
            case 'DISBURSED':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-4 h-4 mr-1.5" /> Đã giải ngân</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><AlertCircle className="w-4 h-4 mr-1.5" /> Từ chối</span>;
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const handleRequestWithdrawal = async () => {
        if (!expenditure) return;

        const confirmMsg = campaign?.type === 'ITEMIZED'
            ? 'Bạn có chắc chắn muốn yêu cầu rút tiền? Hành động này sẽ ĐÓNG đợt chi tiêu này lại.'
            : 'Xác nhận gửi yêu cầu rút tiền cho kế hoạch này?';

        if (!confirm(confirmMsg)) return;

        try {
            setLoading(true);
            const updated = await expenditureService.requestWithdrawal(expenditure.id);
            setExpenditure(updated);
            alert('Yêu cầu rút tiền đã được gửi thành công.');
        } catch (err: any) {
            console.error('Yêu cầu rút tiền thất bại:', err);
            alert(err.response?.data?.message || 'Yêu cầu rút tiền thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Load media for a specific expenditure item
    const loadItemMedia = useCallback(async (itemId: number) => {
        if (itemMedia[itemId]) return;
        setItemMediaLoading(prev => ({ ...prev, [itemId]: true }));
        try {
            const media = await mediaService.getMediaByExpenditureItemId(itemId);
            setItemMedia(prev => ({ ...prev, [itemId]: media }));
        } catch (err) {
            console.error('Failed to load item media:', err);
        } finally {
            setItemMediaLoading(prev => ({ ...prev, [itemId]: false }));
        }
    }, [itemMedia]);

    // Upload media for a specific item
    const handleItemMediaUpload = useCallback(async (itemId: number) => {
        const state = itemUploadState[itemId];
        if (!state || state.files.length === 0) return;
        setItemUploadState(prev => ({ ...prev, [itemId]: { ...prev[itemId], uploading: true } }));
        try {
            const uploadResults = await Promise.all(
                state.files.map(file =>
                    mediaService.uploadMedia(
                        file,
                        expenditure?.campaignId,
                        undefined,
                        Number(id),
                        `Minh chứng vật phẩm #${itemId}`,
                        'PHOTO',
                        undefined,
                        itemId
                    )
                )
            );
            setItemMedia(prev => ({
                ...prev,
                [itemId]: [...(prev[itemId] || []), ...uploadResults],
            }));
            setItemUploadState(prev => ({ ...prev, [itemId]: { uploading: false, files: [], previews: [] } }));
            toast.success(`Đã tải lên ${uploadResults.length} ảnh minh chứng!`);
        } catch (err: any) {
            console.error('Item media upload failed:', err);
            toast.error(err.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
            setItemUploadState(prev => ({ ...prev, [itemId]: { ...prev[itemId], uploading: false } }));
        }
    }, [itemUploadState, expenditure, id]);

    // Delete media for a specific item (Deferred to Save)
    const handleDeleteItemMedia = useCallback(async (itemId: number, mediaId: number) => {
        // Remove from local UI state
        setItemMedia(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || []).filter(m => m.id !== mediaId),
        }));

        // Add to pending deletions for later processing on Save
        setPendingDeleteMediaIds(prev => [...prev, mediaId]);
        toast.success('Đã đánh dấu xóa ảnh minh chứng.');
    }, []);

    // Handle file selection
    const handleItemFileChange = useCallback((itemId: number, files: FileList | null) => {
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        const previews = fileArray.map(f => URL.createObjectURL(f));
        setItemUploadState(prev => ({
            ...prev,
            [itemId]: {
                uploading: false,
                files: [...(prev[itemId]?.files || []), ...fileArray].slice(0, 10),
                previews: [...(prev[itemId]?.previews || []), ...previews].slice(0, 10),
            },
        }));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    const totalPlan = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.expectedPrice || 0), 0);
    const totalReceivedTotal = items.reduce((sum, item) => sum + (donationSummary[item.id] || 0) * (item.expectedPrice || 0), 0);
    const totalActual = items.reduce((sum, item) => sum + ((item.actualQuantity || 0) * (item.price || 0)), 0);
    const compareValue = campaign?.type === 'ITEMIZED' ? totalReceivedTotal : totalPlan;
    const totalVariance = compareValue - totalActual;

    if (error || !expenditure) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-600">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p>{error || 'Không tìm thấy khoản chi'}</p>
                <Link href="/account/campaigns" className="mt-4 inline-block text-orange-600 font-medium">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-3">
                    <Link
                        href={`/account/campaigns/expenditures?campaignId=${expenditure.campaignId}`}
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-3 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chi tiêu
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                Chi tiết khoản chi
                                {getStatusBadge(expenditure.status)}
                            </h1>
                            {campaign && (
                                <p className="mt-0.5 text-xs font-medium text-orange-600 flex items-center gap-2">
                                    Chiến dịch: {campaign.title || campaign.name || 'Không có tên'}
                                </p>
                            )}
                            <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Ngày tạo: {expenditure.createdAt ? new Date(expenditure.createdAt).toLocaleDateString() : 'Không có dữ liệu'}
                            </p>
                        </div>
                        {campaign?.type === 'ITEMIZED' && (expenditure.status === 'APPROVED' || expenditure.status === 'CLOSED') && !expenditure.isWithdrawalRequested && (
                            <button
                                onClick={handleRequestWithdrawal}
                                disabled={loading}
                                className="flex flex-col items-start gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow disabled:opacity-50 text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {loading ? 'Đang xử lý...' : 'Rút tiền'}
                                </span>
                                {(campaign?.balance || 0) > 0 && (
                                    <span className="text-[10px] font-normal opacity-80">
                                        Số dư đợt trước: {new Intl.NumberFormat('vi-VN').format(campaign?.balance || 0)}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* 2-column layout */}
                <div className="flex gap-6 items-start">
                    {/* LEFT COLUMN */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">

                        {/* Summary cards (compact) */}
                        {campaign?.type === 'AUTHORIZED' ? (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-blue-50 px-3 py-2 flex items-center gap-1.5">
                                        <p className="text-[10px] font-semibold text-blue-600 uppercase">Kế hoạch giải ngân</p>
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className="text-2xl font-extrabold text-blue-700 leading-tight">
                                            {new Intl.NumberFormat('vi-VN').format(expenditure.totalExpectedAmount || 0)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Số tiền đã giải ngân theo kế hoạch</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-orange-50 px-3 py-2 flex items-center gap-1.5">
                                        <p className="text-[10px] font-semibold text-orange-600 uppercase">Thực tế đã chi</p>
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className="text-2xl font-extrabold text-orange-700 leading-tight">
                                            {new Intl.NumberFormat('vi-VN').format(expenditure.totalAmount || 0)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Có thể chênh lệch do giá thị trường</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-3 py-2 flex items-center gap-1.5">
                                        <p className="text-[10px] font-semibold text-gray-500 uppercase">Số dư</p>
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className={`text-2xl font-extrabold leading-tight ${(expenditure.totalExpectedAmount - (expenditure.totalAmount || 0)) < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                            {new Intl.NumberFormat('vi-VN').format((expenditure.totalExpectedAmount || 0) - (expenditure.totalAmount || 0))}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Phần tiền dư còn lại sau mua hàng</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-blue-50 px-3 py-2 flex items-center gap-1.5">
                                        <p className="text-[10px] font-semibold text-blue-600 uppercase">Dự kiến</p>
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className="text-2xl font-extrabold text-blue-700 leading-tight">
                                            {new Intl.NumberFormat('vi-VN').format(expenditure.totalExpectedAmount || 0)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Danh sách vật phẩm cần huy động</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-green-50 px-3 py-2 flex items-center gap-1.5">
                                        <p className="text-[10px] font-semibold text-green-600 uppercase">Đã nhận</p>
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className="text-2xl font-extrabold text-green-700 leading-tight">
                                            {new Intl.NumberFormat('vi-VN').format(totalReceivedTotal)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Tiền thực tế donor đã donate</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-orange-50 px-3 py-2 flex items-center gap-1.5">
                                        <p className="text-[10px] font-semibold text-orange-600 uppercase">Đã chi</p>
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className="text-2xl font-extrabold text-orange-700 leading-tight">
                                            {new Intl.NumberFormat('vi-VN').format(expenditure.totalAmount)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Chủ quỹ mua vật phẩm theo kế hoạch</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                    <div className="bg-gray-50 px-3 py-2 flex items-center gap-1.5">
                                        <p className="text-[10px] font-semibold text-gray-500 uppercase">Số dư</p>
                                    </div>
                                    <div className="px-3 py-2">
                                        <p className="text-2xl font-extrabold text-gray-700 leading-tight">
                                            {new Intl.NumberFormat('vi-VN').format((campaign?.balance || 0) + totalVariance)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Dư đợt trước {new Intl.NumberFormat('vi-VN').format(campaign?.balance || 0)} + Dư kỳ này {new Intl.NumberFormat('vi-VN').format(totalVariance)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium text-gray-900 flex items-center">
                                        <Receipt className="w-4 h-4 mr-1.5 text-gray-400" />
                                        Danh sách hạng mục ({items.length})
                                    </h2>
                                    <button
                                        onClick={handleExportItems}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-[10px] font-medium rounded text-gray-600 bg-white hover:bg-gray-50 transition-all"
                                        title="Xuất Excel hạng mục"
                                    >
                                        <Download className="w-3 h-3 mr-1" />
                                        Xuất Excel
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                                {/* Scrollable body */}
                                <div className="overflow-y-auto flex-1">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 shrink-0">
                                            <tr>
                                                <th className="px-2 py-1.5 text-left text-sm font-bold text-gray-700">Tên hàng hóa / Dịch vụ</th>
                                                {campaign?.type === 'AUTHORIZED' ? (
                                                    <>
                                                        <th className="px-2 py-1.5 text-right text-sm font-bold text-blue-600">
                                                            <div>Kế hoạch</div>
                                                            <div className="text-[9px] font-normal text-blue-400">SL x ĐG</div>
                                                        </th>
                                                        <th className="px-2 py-1.5 text-right text-sm font-bold text-red-600">
                                                            <div>Thực tế đã chi</div>
                                                            <div className="text-[9px] font-normal text-red-400">SL x ĐG</div>
                                                        </th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-2 py-1.5 text-right text-sm font-bold text-blue-600">
                                                            <div>Kế hoạch</div>
                                                            <div className="text-[9px] font-normal text-blue-400">SL x ĐG</div>
                                                        </th>
                                                        <th className="px-2 py-1.5 text-right text-sm font-bold text-green-600">
                                                            <div>Đã nhận</div>
                                                            <div className="text-[9px] font-normal text-green-400">SL x ĐG</div>
                                                        </th>
                                                        <th className="px-2 py-1.5 text-right text-sm font-bold text-orange-600">
                                                            <div>Đã chi</div>
                                                            <div className="text-[9px] font-normal text-orange-400">SL x ĐG</div>
                                                        </th>
                                                    </>
                                                )}
                                                <th className="px-2 py-1.5 text-center text-sm font-bold text-gray-700 w-16">Ảnh</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => {
                                                const media = itemMedia[item.id] || [];
                                                return (
                                                    <Fragment key={item.id}>
                                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="px-2 py-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setGalleryModalItemId(item.id);
                                                                        loadItemMedia(item.id);
                                                                    }}
                                                                    className="w-full text-left group"
                                                                >
                                                                    <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{item.category}</div>
                                                                    {item.note && <div className="text-xs text-gray-400 mt-0.5">{item.note}</div>}
                                                                </button>
                                                            </td>
                                                            {campaign?.type === 'AUTHORIZED' ? (
                                                                <>
                                                                    <td className="px-2 py-2 text-right">
                                                                        <div className="font-semibold text-blue-700">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.quantity || 0) * (item.expectedPrice || 0))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right">
                                                                        <div className="font-semibold text-red-700">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.actualQuantity || 0) * (item.price || 0))}
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="px-2 py-2 text-right">
                                                                        <div className="font-semibold text-blue-700">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.quantity || 0) * (item.expectedPrice || 0))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right">
                                                                        <div className="font-semibold text-green-700">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((donationSummary[item.id] || 0) * (item.expectedPrice || 0))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-2 text-right">
                                                                        <div className="font-semibold text-orange-700">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.actualQuantity || 0) * item.price)}
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}
                                                            <td className="px-2 py-2 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        setGalleryModalItemId(item.id);
                                                                        loadItemMedia(item.id);
                                                                    }}
                                                                    className="w-9 h-9 rounded overflow-hidden border border-orange-200 hover:border-orange-400 transition-all"
                                                                    title="Nhấn để xem ảnh minh chứng"
                                                                >
                                                                    {itemMediaLoading[item.id] ? (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                            <div className="w-3 h-3 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                                                                        </div>
                                                                    ) : media.length > 0 ? (
                                                                        <img src={media[0].url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                                            <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Sticky Footer */}
                                <table className="w-full text-sm shrink-0 table-fixed">
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                                            <td className="px-2 py-2 text-sm uppercase">Tổng cộng đợt chi</td>
                                            {campaign?.type === 'AUTHORIZED' ? (
                                                <>
                                                    <td className="px-2 py-2 text-right">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPlan)}</td>
                                                    <td className="px-2 py-2 text-right">
                                                        <div className="text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalActual)}</div>
                                                        <div className={`text-xs uppercase ${(expenditure.totalExpectedAmount - totalActual) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            Số dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((expenditure.totalExpectedAmount || 0) - totalActual)}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-2 py-2 text-right">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPlan)}</td>
                                                    <td className="px-2 py-2 text-right">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalReceivedTotal)}</td>
                                                    <td className="px-2 py-2 text-right">
                                                        <div className="text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalActual)}</div>
                                                        <div className={`text-xs uppercase ${totalVariance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            Số dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalVariance)}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-2 py-2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="w-80 shrink-0 flex flex-col gap-4">

                        {/* New Evidence Submission Status - VISUAL FOCUS */}
                        {(expenditure.evidenceStatus === 'SUBMITTED' || expenditure.evidenceStatus === 'APPROVED' || expenditure.evidenceStatus === 'ALLOWED_EDIT') && (
                            <div className="bg-emerald-50 shadow-sm rounded-2xl border-2 border-emerald-100 p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-emerald-100 rounded-full opacity-30 animate-pulse"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-emerald-900 uppercase tracking-wide">Đã nộp minh chứng</h3>
                                            {expenditure.evidenceSubmittedAt && (
                                                <p className="text-[11px] font-bold text-emerald-600/70">
                                                    Lúc {new Date(expenditure.evidenceSubmittedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {expenditure.evidenceSubmittedAt && expenditure.evidenceDueAt && new Date(expenditure.evidenceSubmittedAt) <= new Date(expenditure.evidenceDueAt) && (
                                            <span className="px-2.5 py-1 bg-white text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 shadow-sm">
                                                Nộp đúng hạn
                                            </span>
                                        )}
                                        {expenditure.transactions?.some(t => t.type === 'REFUND' && t.status === 'COMPLETED') ? (
                                            <span className="px-2.5 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md flex items-center gap-1.5">
                                                <ShieldCheck className="w-3 h-3" /> Đã hoàn tiền dư
                                            </span>
                                        ) : (
                                            (totalVariance > 0) && (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-200">
                                                    Chờ hoàn tiền dư
                                                </span>
                                            )
                                        )}
                                    </div>

                                    {/* Link to Post */}
                                    {posts.length > 0 && (
                                        <div className="pt-4 border-t border-emerald-200">
                                            <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-[2px] mb-3">Bài viết minh chứng</p>
                                            <div className="flex flex-col gap-2">
                                                {posts.map(p => (
                                                    <Link
                                                        key={p.id}
                                                        href={`/post/${p.id}`}
                                                        target="_blank"
                                                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 hover:translate-x-1 transition-all group shadow-sm text-sm font-bold text-emerald-700"
                                                    >
                                                        <span className="truncate flex-1 pr-4">{p.title || 'Xem chi tiết bài viết'}</span>
                                                        <ArrowLeft className="w-4 h-4 rotate-180 opacity-40 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* Plan/Description */}
                        <div className="bg-white rounded p-4 border border-gray-200">
                            <h2 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                Mô tả / Kế hoạch
                            </h2>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{expenditure.plan || 'Không có mô tả'}</p>
                        </div>
                    </div>
                </div>

                {isUpdateModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsUpdateModalOpen(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                                                Cập nhật Đã chi Chi tiêu
                                            </h3>

                                            <div className="mt-4">
                                                <div className="flex-1 max-h-[500px] overflow-y-auto bg-gray-50/50 rounded-xl border border-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50 sticky top-0 z-20">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-tighter whitespace-nowrap">Hàng hóa</th>
                                                                <th className="px-4 py-3 text-right text-xs font-black text-blue-600 uppercase tracking-tighter bg-blue-50 whitespace-nowrap">Kế hoạch</th>
                                                                <th className="px-4 py-3 text-center text-xs font-black text-orange-600 uppercase tracking-tighter bg-orange-50 whitespace-nowrap">Thực tế đã chi</th>
                                                                <th className="px-4 py-3 text-center text-xs font-black text-gray-500 uppercase tracking-tighter whitespace-nowrap">Ảnh</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {items.map((item, index) => {
                                                                const modalMedia = itemMedia[item.id] || [];
                                                                return (
                                                                    <Fragment key={item.id}>
                                                                        <tr className="hover:bg-gray-50">
                                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                                <div className="font-bold">{item.category}</div>
                                                                                {item.note && <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{item.note}</div>}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right bg-blue-50/30 align-top whitespace-nowrap">
                                                                                <div className="flex flex-col min-h-[100px] justify-between">
                                                                                    <div className="flex flex-col gap-0.5">
                                                                                        <div className="flex items-center justify-end gap-1.5 text-blue-400/70">
                                                                                            <span className="text-[9px] font-black uppercase tracking-tighter">SL:</span>
                                                                                            <span className="text-[11px] font-bold">{item.quantity}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center justify-end gap-1.5 text-blue-400/70">
                                                                                            <span className="text-[9px] font-black uppercase tracking-tighter">ĐG:</span>
                                                                                            <span className="text-[11px] font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right pt-1.5 border-t border-blue-100 mt-2">
                                                                                        <div className="font-black text-blue-600 text-sm lg:text-base">
                                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * (item.expectedPrice || 0))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 bg-orange-50/20 align-top">
                                                                                <div className="flex flex-col min-h-[100px] justify-between">
                                                                                    <div className="flex flex-col gap-1.5">
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                            <label className="text-[9px] font-black text-orange-400 uppercase tracking-tighter">SL:</label>
                                                                                            <input
                                                                                                type="number" min="0"
                                                                                                className="w-14 border-orange-200 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-[11px] font-bold text-right py-0.5 px-1.5"
                                                                                                value={updateItems[index]?.actualQuantity}
                                                                                                onChange={(e) => handleUpdateItemChange(index, 'actualQuantity', e.target.value)}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                            <label className="text-[9px] font-black text-orange-400 uppercase tracking-tighter whitespace-nowrap">ĐG:</label>
                                                                                            <input
                                                                                                type="number" min="0"
                                                                                                className="w-20 border-orange-200 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-[11px] font-bold text-right py-0.5 px-1.5"
                                                                                                value={updateItems[index]?.price}
                                                                                                onChange={(e) => handleUpdateItemChange(index, 'price', e.target.value)}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right pt-1.5 border-t border-orange-100 mt-2">
                                                                                        <div className="font-black text-orange-600 text-sm lg:text-base">
                                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((updateItems[index]?.actualQuantity || 0) * (updateItems[index]?.price || 0))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 align-middle text-center">
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
                                                                                            <ImageIcon className="w-4 h-4 text-gray-400 group-hover/btn:text-orange-500" />
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="text-[9px] text-gray-400 group-hover/btn:text-orange-600 font-bold uppercase tracking-tighter">Gallery</span>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    </Fragment>
                                                                );
                                                            })}
                                                        </tbody>
                                                        <tfoot className="bg-gray-100 sticky bottom-0 z-10 border-t-2 border-gray-300">
                                                            {(() => {
                                                                const totalPlan = items.reduce((sum, item) => sum + item.quantity * (item.expectedPrice || 0), 0);
                                                                const totalActual = updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0);
                                                                const totalVariance = totalPlan - totalActual;
                                                                const budgetLimit = campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0);
                                                                const isOverBudget = totalActual > budgetLimit;

                                                                return (
                                                                    <tr>
                                                                        <td className="px-4 py-4 font-black text-gray-900 text-sm uppercase">Tổng cộng hồ sơ</td>
                                                                        <td className="px-4 py-4 text-right bg-blue-100/50">
                                                                            <div className="text-[10px] uppercase font-black text-blue-500 mb-0.5 whitespace-nowrap">Tổng Kế hoạch</div>
                                                                            <div className="text-2xl lg:text-3xl font-black text-blue-700">
                                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPlan)}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-4 text-right bg-orange-100/50">
                                                                            <div className="text-[10px] uppercase font-black text-orange-500 mb-0.5 whitespace-nowrap">Tổng Thực tế đã chi</div>
                                                                            <div className={`text-2xl lg:text-3xl font-black ${isOverBudget ? 'text-red-600' : 'text-orange-700'}`}>
                                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalActual)}
                                                                            </div>
                                                                            <div className={`mt-2 p-2 rounded border-2 ${totalVariance < 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                                                                <div className="text-[10px] uppercase font-black opacity-70">
                                                                                    {totalVariance < 0 ? 'CHÚ Ý: Vượt hạn mức chi phí' : 'Số dư'}
                                                                                </div>
                                                                                <div className="text-lg font-black">
                                                                                    {totalVariance > 0 && '+'}
                                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalVariance)}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-4 bg-gray-100"></td>
                                                                    </tr>
                                                                );
                                                            })()}
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleUpdateSubmit}
                                        disabled={updating || updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > (campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0))}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${updating || updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > (campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0))
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-orange-600 hover:bg-orange-700'
                                            }`}
                                    >
                                        {updating ? 'Đang lưu...' : 'Lưu cập nhật'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsUpdateModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery Modal */}
            {galleryModalItemId !== null && (
                <ExpenditureGalleryModal
                    isOpen={true}
                    onClose={() => setGalleryModalItemId(null)}
                    itemName={items.find(i => i.id === galleryModalItemId)?.category || ''}
                    media={itemMedia[galleryModalItemId!] || []}
                    loading={itemMediaLoading[galleryModalItemId!]}
                    isReadOnly={true}
                    onDelete={(mediaId) => handleDeleteItemMedia(galleryModalItemId!, mediaId)}
                    uploadState={itemUploadState[galleryModalItemId!] || { uploading: false, files: [], previews: [] }}
                    onFileChange={(files) => handleItemFileChange(galleryModalItemId!, files)}
                    onUploadSubmit={() => handleItemMediaUpload(galleryModalItemId!)}
                />
            )}

            {/* Image Gallery Modal */}
            <ImageZoomModal
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                images={galleryImages}
                initialIndex={galleryIndex}
            />
        </div>
    );
}
