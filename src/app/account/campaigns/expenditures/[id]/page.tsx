'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { mediaService } from '@/services/mediaService';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { ArrowLeft, Calendar, FileText, CheckCircle, AlertCircle, Clock, Receipt, Image as ImageIcon, Upload, Trash2, ChevronDown } from 'lucide-react';
import type { MediaUploadResponse } from '@/services/mediaService';
import { toast } from 'react-hot-toast';

export default function ExpenditureDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
    const [campaign, setCampaign] = useState<any | null>(null);
    const [items, setItems] = useState<ExpenditureItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; price: number; }[]>([]);
    const [updating, setUpdating] = useState(false);

    // Item media state
    const [itemMedia, setItemMedia] = useState<Record<number, MediaUploadResponse[]>>({});
    const [itemMediaLoading, setItemMediaLoading] = useState<Record<number, boolean>>({});
    const [itemUploadState, setItemUploadState] = useState<Record<number, { uploading: boolean; files: File[]; previews: string[] }>>({});
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

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
                setItems(itemsData);

                // Initialize update items
                setUpdateItems(itemsData.map(item => ({
                    id: item.id,
                    actualQuantity: item.actualQuantity || 0,
                    price: item.price || 0
                })));
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
            // Load media for all items
            items.forEach(item => loadItemMedia(item.id));
        }
        setIsUpdateModalOpen(true);
    };

    const handleUpdateItemChange = (index: number, field: 'actualQuantity' | 'price', value: string) => {
        const newItems = [...updateItems];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setUpdateItems(newItems);
    };

    const handleUpdateSubmit = async () => {
        try {
            setUpdating(true);
            await expenditureService.updateActuals(id, updateItems);

            // Refresh data
            const expData = await expenditureService.getById(id);
            setExpenditure(expData);
            const itemsData = await expenditureService.getItems(id);
            setItems(itemsData);

            setIsUpdateModalOpen(false);
            alert('Cập nhật thành công!');
        } catch (err) {
            console.error('Cập nhật thất bại:', err);
            alert('Cập nhật thất bại. Vui lòng thử lại.');
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

    // Delete media for a specific item
    const handleDeleteItemMedia = useCallback(async (itemId: number, mediaId: number) => {
        try {
            await mediaService.deleteMedia(mediaId);
            setItemMedia(prev => ({
                ...prev,
                [itemId]: (prev[itemId] || []).filter(m => m.id !== mediaId),
            }));
            toast.success('Đã xóa ảnh minh chứng.');
        } catch (err) {
            console.error('Failed to delete media:', err);
            toast.error('Không thể xóa ảnh. Vui lòng thử lại.');
        }
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={`/account/campaigns/expenditures?campaignId=${expenditure.campaignId}`}
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chi tiêu
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                Chi tiết khoản chi
                                {getStatusBadge(expenditure.status)}
                                {expenditure.isWithdrawalRequested && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        <CheckCircle className="w-4 h-4 mr-1.5" /> Đã yêu cầu rút tiền
                                    </span>
                                )}
                            </h1>
                            <p className="mt-2 text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ngày tạo: {expenditure.createdAt ? new Date(expenditure.createdAt).toLocaleDateString() : 'Không có dữ liệu'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                    onClick={handleOpenUpdateModal}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors"
                                >
                                    <FileText className="w-4 h-4 mr-1.5" /> Cập nhật Đã chi
                                </button>

                                {campaign?.type === 'ITEMIZED' && (expenditure.status === 'APPROVED' || expenditure.status === 'CLOSED') && !expenditure.isWithdrawalRequested && (
                                    <button
                                        onClick={handleRequestWithdrawal}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
                                    >
                                        <Clock className="w-5 h-5" />
                                        {loading ? 'Đang xử lý...' : 'Rút tiền'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3-Frame Summary Layout */}
                    {campaign?.type === 'AUTHORIZED' ? (
                        <div className="flex justify-center mb-8">
                            {/* Frame: Amount to Withdraw - Single Focus for AUTHORIZED */}
                            <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-md relative overflow-hidden max-w-md w-full text-center">
                                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-orange-100 rounded-full opacity-50"></div>
                                <p className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-widest">Số tiền muốn rút</p>
                                <p className="text-3xl font-extrabold text-gray-900 mb-1">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expenditure.totalExpectedAmount || 0)}
                                </p>
                                <p className="text-xs text-orange-500 font-semibold italic">Tổng ngân sách dự kiến giải ngân cho đợt này</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {/* Frame 1: Dự kiến */}
                            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm text-center">
                                <p className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wide">Dự kiến</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expenditure.totalExpectedAmount || 0)}
                                </p>
                            </div>

                            {/* Frame 2: Đã nhận */}
                            <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-1 -mr-1 w-8 h-8 bg-green-100 rounded-full opacity-50"></div>
                                <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Đã nhận</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                                </p>
                            </div>

                            {/* Frame 3: Đã chi */}
                            <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm text-center">
                                <p className="text-xs font-medium text-orange-600 mb-1 uppercase tracking-wide">Đã chi</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expenditure.totalAmount)}
                                </p>
                            </div>

                            {/* Frame 4: Số dư quỹ */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Số dư quỹ</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign?.balance || 0)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        {/* Plan/Description */}
                        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                                Mô tả / Kế hoạch
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{expenditure.plan || 'Không có mô tả'}</p>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Receipt className="w-5 h-5 mr-2 text-gray-400" />
                                    Danh sách hạng mục ({items.length})
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên hàng hóa</th>
                                            {campaign?.type === 'AUTHORIZED' ? (
                                                <th className="px-6 py-3 text-right text-xs font-medium text-orange-600 uppercase tracking-wider bg-orange-50">Thành tiền dự kiến rút</th>
                                            ) : (
                                                <>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">Kế hoạch</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider bg-green-50">Đã nhận</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-orange-600 uppercase tracking-wider bg-orange-50">Đã chi</th>
                                                </>
                                            )}
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.map((item) => {
                                            const isExpanded = expandedItemId === item.id;
                                            const media = itemMedia[item.id] || [];
                                            const uploadState = itemUploadState[item.id] || { uploading: false, files: [], previews: [] };
                                            return (
                                                <Fragment key={item.id}>
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => {
                                                                    if (!isExpanded) {
                                                                        setExpandedItemId(item.id);
                                                                        loadItemMedia(item.id);
                                                                    } else {
                                                                        setExpandedItemId(null);
                                                                    }
                                                                }}
                                                                className="w-full text-left group"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform group-hover:text-gray-600 ${isExpanded ? 'rotate-180' : ''}`} />
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">{item.category}</div>
                                                                        {item.note && <div className="text-xs text-gray-500 mt-1">{item.note}</div>}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        </td>
                                                        {campaign?.type === 'AUTHORIZED' ? (
                                                            <td className="px-6 py-4 text-right bg-orange-50/30">
                                                                <div className="text-sm font-bold text-orange-700">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.quantity || 0) * (item.expectedPrice || 0))}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}
                                                                </div>
                                                            </td>
                                                        ) : (
                                                            <>
                                                                <td className="px-6 py-4 text-right bg-blue-50/30">
                                                                    <div className="text-sm font-bold text-blue-700">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.quantity || 0) * (item.expectedPrice || 0))}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right bg-green-50/30">
                                                                    <div className="text-sm font-bold text-green-700">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-1 italic">(Chưa có dữ liệu)</div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right bg-orange-50/30">
                                                                    <div className="text-sm font-bold text-orange-700">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.actualQuantity || 0) * item.price)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {item.actualQuantity || 0} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    if (!isExpanded) {
                                                                        setExpandedItemId(item.id);
                                                                        loadItemMedia(item.id);
                                                                    } else {
                                                                        setExpandedItemId(null);
                                                                    }
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors border border-orange-200 text-orange-700 hover:bg-orange-50"
                                                            >
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                                {itemMediaLoading[item.id] ? (
                                                                    <div className="w-3 h-3 border border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                                                                ) : (
                                                                    media.length
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {/* Expanded: Image Upload per Item */}
                                                    {isExpanded && (
                                                        <tr key={`${item.id}-expanded`}>
                                                            <td colSpan={campaign?.type === 'AUTHORIZED' ? 3 : 5} className="px-6 py-6 bg-orange-50/20 border-t border-orange-100">
                                                                <div className="space-y-4">
                                                                    {/* Header */}
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="text-xs font-black uppercase tracking-widest text-orange-800">
                                                                            Ảnh minh chứng cho: <span className="font-bold">{item.category}</span>
                                                                        </h4>
                                                                        <span className="text-[10px] font-bold text-gray-400">{media.length} / 10 ảnh</span>
                                                                    </div>

                                                                    {/* Existing Images */}
                                                                    {media.length > 0 && (
                                                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                                                            {media.map((m) => (
                                                                                <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden group/img border border-gray-200 shadow-sm">
                                                                                    <img
                                                                                        src={m.url}
                                                                                        alt={`Minh chứng ${m.id}`}
                                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/placeholder.png'; }}
                                                                                    />
                                                                                    <button
                                                                                        onClick={() => handleDeleteItemMedia(item.id, m.id)}
                                                                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500"
                                                                                    >
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Upload Area */}
                                                                    {media.length < 10 && (
                                                                        <div className="space-y-3">
                                                                            {/* Preview New Files */}
                                                                            {uploadState.previews.length > 0 && (
                                                                                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                                                                    {uploadState.previews.map((preview, idx) => (
                                                                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-emerald-300 bg-emerald-50">
                                                                                            <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover opacity-80" />
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {/* Upload Button */}
                                                                            <div className="relative group/upload">
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    multiple
                                                                                    onChange={(e) => handleItemFileChange(item.id, e.target.files)}
                                                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                                    disabled={uploadState.uploading}
                                                                                />
                                                                                <div className="border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all cursor-pointer">
                                                                                    {uploadState.uploading ? (
                                                                                        <div className="w-8 h-8 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                                                                                    ) : (
                                                                                        <>
                                                                                            <Upload className="w-6 h-6 text-gray-400 group-hover/upload:text-orange-400" />
                                                                                            <p className="text-xs font-bold text-gray-400 group-hover/upload:text-orange-600">Tải ảnh minh chứng</p>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {uploadState.files.length > 0 && (
                                                                                <button
                                                                                    onClick={() => handleItemMediaUpload(item.id)}
                                                                                    disabled={uploadState.uploading}
                                                                                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg transition-all ${uploadState.uploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98]'}`}
                                                                                >
                                                                                    <Upload className="w-4 h-4" />
                                                                                    Tải lên {uploadState.files.length} ảnh
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {media.length >= 10 && (
                                                                        <p className="text-center text-xs font-bold text-gray-400 italic py-4">Đã đạt giới hạn 10 ảnh cho mỗi vật phẩm.</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 space-y-6">
                        {/* Evidence Info */}
                        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin minh chứng</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Trạng thái minh chứng</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {expenditure.evidenceStatus || 'Chưa cập nhật'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Hạn nộp dự kiến</p>
                                    <p className="text-sm font-medium text-gray-900 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {expenditure.evidenceDueAt ? new Date(expenditure.evidenceDueAt).toLocaleDateString() : 'Chưa đặt hạn'}
                                    </p>
                                </div>

                                {/* Evidence is now managed per item — see item rows above */}
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <button disabled className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed">
                                        Cập nhật minh chứng (Sắp ra mắt)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Update Modal */}
                {
                    isUpdateModalOpen && (
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

                                                {/* Summary items for Modal */}
                                                <div className="mb-4 flex flex-wrap gap-4 text-sm">
                                                    <div className="bg-green-50 px-3 py-2 rounded border border-green-200">
                                                        <span className="text-green-800 font-medium">
                                                            {campaign?.type === 'AUTHORIZED' ? 'Hạn mức chi (Số dư quỹ):' : 'Tổng Đã nhận:'}
                                                        </span>{' '}
                                                        <span className="font-bold text-green-700">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0))}
                                                        </span>
                                                    </div>
                                                    <div className={`px-3 py-2 rounded border ${updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > (campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0)) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                                        <span className={`${updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > (campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0)) ? 'text-red-800' : 'text-gray-800'} font-medium`}>Tổng Đã chi đang nhập:</span>{' '}
                                                        <span className={`font-bold ${updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > (campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0)) ? 'text-red-700' : 'text-gray-700'}`}>
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0))}
                                                        </span>
                                                    </div>
                                                </div>

                                                {updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > (campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0)) && (
                                                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-2" />
                                                        Tổng chi thực tế ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0))})
                                                        vượt quá hạn mức cho phép ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (expenditure.totalExpectedAmount || 0))}). Bạn không thể lưu.
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hàng hóa</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">Kế hoạch</th>
                                                                    {campaign?.type !== 'AUTHORIZED' && (
                                                                        <th className="px-4 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider bg-green-50">Đã nhận</th>
                                                                    )}
                                                                    <th className="px-4 py-3 text-center text-xs font-medium text-orange-600 uppercase tracking-wider bg-orange-50">Đã chi (Nhập liệu)</th>
                                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {items.map((item, index) => {
                                                                    const modalMedia = itemMedia[item.id] || [];
                                                                    const modalUploadState = itemUploadState[item.id] || { uploading: false, files: [], previews: [] };
                                                                    return (
                                                                        <Fragment key={item.id}>
                                                                            <tr>
                                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                                    <div className="font-medium">{item.category}</div>
                                                                                    {item.note && <div className="text-xs text-gray-500">{item.note}</div>}
                                                                                </td>

                                                                                {/* Plan Info */}
                                                                                <td className="px-4 py-3 text-right text-sm text-gray-500 bg-blue-50/30">
                                                                                    <div className="font-medium text-blue-700">
                                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * (item.expectedPrice || 0))}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-400">
                                                                                        {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}
                                                                                    </div>
                                                                                </td>

                                                                                {campaign?.type !== 'AUTHORIZED' && (
                                                                                    <td className="px-4 py-3 text-right text-sm text-gray-500 bg-green-50/30">
                                                                                        <div className="font-medium text-green-700">
                                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                                                                                        </div>
                                                                                    </td>
                                                                                )}

                                                                                {/* Actual Input */}
                                                                                <td className="px-4 py-3 bg-orange-50/30">
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                            <label className="text-xs text-gray-500">SL:</label>
                                                                                            <input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-right"
                                                                                                placeholder="SL"
                                                                                                value={updateItems[index]?.actualQuantity}
                                                                                                onChange={(e) => handleUpdateItemChange(index, 'actualQuantity', e.target.value)}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                            <label className="text-xs text-gray-500">ĐG:</label>
                                                                                            <input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                step="1"
                                                                                                className="w-28 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-right"
                                                                                                placeholder="Đơn giá"
                                                                                                value={updateItems[index]?.price}
                                                                                                onChange={(e) => handleUpdateItemChange(index, 'price', e.target.value)}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="text-right pt-1 border-t border-orange-200">
                                                                                            <div className="text-xs text-gray-500">Thành tiền:</div>
                                                                                            <div className="font-bold text-orange-700">
                                                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((updateItems[index]?.actualQuantity || 0) * (updateItems[index]?.price || 0))}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>

                                                                                {/* Image Column */}
                                                                                <td className="px-4 py-3 align-top">
                                                                                    {itemMediaLoading[item.id] ? (
                                                                                        <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin mx-auto" />
                                                                                    ) : (
                                                                                        <div className="space-y-1.5">
                                                                                            {/* Existing thumbnails */}
                                                                                            {modalMedia.slice(0, 3).map((m) => (
                                                                                                <div key={m.id} className="relative group w-10 h-10 mx-auto">
                                                                                                    <img src={m.url} alt="Minh chứng" className="w-full h-full object-cover rounded border border-gray-200" />
                                                                                                    <button
                                                                                                        onClick={() => handleDeleteItemMedia(item.id, m.id)}
                                                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                    >
                                                                                                        <Trash2 className="w-2 h-2" />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ))}
                                                                                            {modalMedia.length > 3 && (
                                                                                                <div className="text-[9px] text-gray-400 text-center">+{modalMedia.length - 3}</div>
                                                                                            )}

                                                                                            {/* Upload trigger */}
                                                                                            {modalMedia.length < 10 && (
                                                                                                <div className="relative group/upload w-10 h-10 mx-auto">
                                                                                                    <input
                                                                                                        type="file"
                                                                                                        accept="image/*"
                                                                                                        multiple
                                                                                                        onChange={(e) => {
                                                                                                            handleItemFileChange(item.id, e.target.files);
                                                                                                        }}
                                                                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                                                        disabled={modalUploadState.uploading}
                                                                                                    />
                                                                                                    <div className="w-full h-full border-2 border-dashed border-gray-300 hover:border-orange-400 rounded flex items-center justify-center transition-all">
                                                                                                        {modalUploadState.uploading ? (
                                                                                                            <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                                                                                                        ) : (
                                                                                                            <Upload className="w-3.5 h-3.5 text-gray-400 group-hover/upload:text-orange-500" />
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Upload button */}
                                                                                            {modalUploadState.files.length > 0 && (
                                                                                                <button
                                                                                                    onClick={() => handleItemMediaUpload(item.id)}
                                                                                                    disabled={modalUploadState.uploading}
                                                                                                    className={`w-full py-1 rounded text-[9px] font-bold flex items-center justify-center gap-0.5 transition-all ${modalUploadState.uploading ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                                                                                                >
                                                                                                    <Upload className="w-2.5 h-2.5" />{modalUploadState.files.length}
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        </Fragment>
                                                                    );
                                                                })}
                                                            </tbody>
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
                    )
                }
            </div>
        </div>
    );
}
