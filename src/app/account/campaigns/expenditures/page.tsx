'use client';

import { useEffect, useState, useMemo, Fragment, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight, ArrowRight, ShieldCheck, User, MoreVertical, X, Image as ImageIcon, Upload, Trash2, ChevronRight, Receipt, ChevronDown, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import CreateOrEditPostModal from '@/components/feed-post/CreateOrEditPostModal';
import Image from 'next/image';

const planeImg = '/assets/img/campaign/5.png';
const blocksImg = '/assets/img/campaign/6.png';
const infinityImg = '/assets/img/campaign/7.png';
const flowBgImg = '/assets/img/campaign/8.png';

import { api } from '@/config/axios';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { mediaService } from '@/services/mediaService';
import { feedPostService } from '@/services/feedPostService';
import { paymentService, DonationItemSummary } from '@/services/paymentService';
import { toast } from 'react-hot-toast';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';
import { FileUp, Send } from 'lucide-react';
import type { MediaUploadResponse } from '@/services/mediaService';
import ImageZoomModal from '@/components/feed-post/ImageZoomModal';
import ExpenditureGalleryModal from '@/components/campaign/ExpenditureGalleryModal';
import EvidenceDeadlineBanner from '@/components/campaign/EvidenceDeadlineBanner';

export default function CampaignExpendituresPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams?.get('campaignId');
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Withdrawal Modal States
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
    const [evidenceDate, setEvidenceDate] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
    const [donationSummary, setDonationSummary] = useState<Record<number, number>>({});
    const [loadingDonationSummary, setLoadingDonationSummary] = useState(false);

    // Expandable Row State
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [selectedLogStep, setSelectedLogStep] = useState<number>(1);

    // Item Media State
    const [itemMedia, setItemMedia] = useState<Record<number, MediaUploadResponse[]>>({});
    const [itemMediaLoading, setItemMediaLoading] = useState<Record<number, boolean>>({});
    const [itemUploadState, setItemUploadState] = useState<Record<number, { uploading: boolean; files: File[]; previews: string[] }>>({});
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [galleryModalItemId, setGalleryModalItemId] = useState<number | null>(null);

    // Update Modal States (Step 4)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateExpenditure, setUpdateExpenditure] = useState<Expenditure | null>(null);

    // Staff name map: key = expenditure id, value = staff full name
    const [staffNameMap, setStaffNameMap] = useState<Record<number, string>>({});

    useEffect(() => {
        if (!expenditures || expenditures.length === 0) return;
        expenditures.forEach(async (exp) => {
            if (staffNameMap[exp.id] !== undefined) return;
            try {
                const res = await api.get(`/api/admin/tasks/type/EXPENDITURE/target/${exp.id}`);
                const name = res.data?.staffName;
                if (name) {
                    setStaffNameMap(prev => ({ ...prev, [exp.id]: name }));
                } else if (res.data?.staffId) {
                    setStaffNameMap(prev => ({ ...prev, [exp.id]: `Nhân viên #${res.data.staffId}` }));
                } else {
                    setStaffNameMap(prev => ({ ...prev, [exp.id]: '' }));
                }
            } catch {
                setStaffNameMap(prev => ({ ...prev, [exp.id]: '' }));
            }
        });
    }, [expenditures]);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; price: number }[]>([]);
    const [updateItemsData, setUpdateItemsData] = useState<ExpenditureItem[]>([]);
    const [updating, setUpdating] = useState(false);
    const [pendingDeleteMediaIds, setPendingDeleteMediaIds] = useState<number[]>([]);

    // Lightbox state
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<{ url: string; alt?: string }[]>([]);
    const [galleryIndex, setGalleryIndex] = useState(0);

    // Create post modal state
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postExpenditure, setPostExpenditure] = useState<Expenditure | null>(null);
    const [currentDraftPost, setCurrentDraftPost] = useState<any>(null);
    // Track draft post per expenditure (loaded from BE)
    const [expenditurePosts, setExpenditurePosts] = useState<Record<number, any[]>>({});

    // Evidence Submission States
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [evidenceDescription, setEvidenceDescription] = useState('');

    // Refund Modal State
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundExpenditure, setRefundExpenditure] = useState<Expenditure | null>(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundFile, setRefundFile] = useState<File | null>(null);
    const [refundFilePreview, setRefundFilePreview] = useState<string | null>(null);
    const [refundUploading, setRefundUploading] = useState(false);
    const [refundSubmitting, setRefundSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!campaignId) return;
        try {
            setLoading(true);
            // Fetch campaign details
            const campaignData = await campaignService.getById(Number(campaignId));
            setCampaign(campaignData);

            // Fetch expenditures
            const expendituresData = await expenditureService.getByCampaignId(Number(campaignId));
            let exps: any[] = Array.isArray(expendituresData) ? expendituresData : [];

            // Also fetch expenditure items for ITEMIZED campaigns so withdrawal modal can show donation summary
            if (exps.length > 0) {
                try {
                    const allItems = await expenditureService.getItemsByCampaignId(Number(campaignId));
                    const itemsByExp: Record<number, any[]> = {};
                    (allItems || []).forEach((item: any) => {
                        if (!itemsByExp[item.expenditureId]) itemsByExp[item.expenditureId] = [];
                        itemsByExp[item.expenditureId].push(item);
                    });
                    exps = exps.map((exp: any) => ({ ...exp, items: itemsByExp[exp.id] || [] }));
                } catch {
                    // non-critical, just show modal without items
                    exps = exps.map((exp: any) => ({ ...exp, items: [] }));
                }
            }

            // Pre-load draft posts for DISBURSED expenditures
            const disbursedExps = exps.filter((e: any) => e.status === 'DISBURSED');
            const postPromises = disbursedExps.map((e: any) =>
                feedPostService.getByTarget(e.id, 'EXPENDITURE')
                    .catch(() => [] as any[])
            );
            const postResults = await Promise.all(postPromises);
            const postsMap: Record<number, any[]> = {};
            disbursedExps.forEach((e: any, i: number) => {
                postsMap[e.id] = postResults[i];
            });
            setExpenditurePosts(postsMap);

            setExpenditures(exps);
        } catch (err) {
            console.error('Không thể tải dữ liệu:', err);
            setError('Không thể tải dữ liệu chiến dịch hoặc khoản chi.');
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }
        fetchData();
    }, [fetchData, isAuthenticated, authLoading, router]);

    // Load media for all expenditure items when expenditures change
    useEffect(() => {
        expenditures.forEach(exp => {
            exp.items?.forEach(item => {
                loadItemMedia(item.id);
            });
        });
    }, [expenditures]);

    const totalSpent = useMemo(() => {
        return expenditures.reduce((sum, exp) => sum + exp.totalAmount, 0);
    }, [expenditures]);

    // === Logic kiểm tra điều kiện tạo expenditure mới ===
    const { canCreate, blockReason, isDisabled } = useMemo(() => {
        if (!campaign) return { canCreate: true, blockReason: null, isDisabled: false };

        if (campaign.status === 'DISABLED') {
            return {
                canCreate: false,
                blockReason: 'Chiến dịch đã bị vô hiệu hóa. Mọi hoạt động quản lý tài chính hiện bị tạm dừng.',
                isDisabled: true
            };
        }

        if (expenditures.length === 0) return { canCreate: true, blockReason: null, isDisabled: false };

        // Chỉ kiểm tra khoản chi gần nhất
        const latestExp = expenditures[0];
        const isDisbursed = latestExp.status === 'DISBURSED';
        const isRejected = latestExp.status === 'REJECTED';
        const hasEvidenceSubmitted = latestExp.evidenceStatus === 'SUBMITTED' || latestExp.evidenceStatus === 'APPROVED';

        if (!isDisbursed && !isRejected) {
            return {
                canCreate: false,
                isDisabled: false,
                blockReason: 'Khoản chi gần nhất chưa được giải ngân. Vui lòng chờ Admin xác nhận giải ngân trước khi tạo khoản chi mới.'
            };
        }

        if (isDisbursed && !hasEvidenceSubmitted) {
            return {
                canCreate: false,
                isDisabled: false,
                blockReason: 'Khoản chi gần nhất đã giải ngân nhưng chưa nộp minh chứng. Vui lòng nộp minh chứng trước khi tạo khoản chi mới.'
            };
        }

        return { canCreate: true, blockReason: null, isDisabled: false };
    }, [campaign, expenditures]);
    // === END ===

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'APPROVED':
            case 'WITHDRAWAL_REQUESTED':
            case 'CLOSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-400 border border-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Đã duyệt</span>;
            case 'DISBURSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-400 border border-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Đã giải ngân</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100"><X className="w-3 h-3 mr-1" /> Bị từ chối</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100">{status}</span>;
        }
    };

    const handleRequestWithdrawal = async (id: number) => {
        setSelectedExpId(id);
        setEvidenceDate('');
        setModalError(null);
        setShowWithdrawalModal(true);

        // Fetch donation summary for items (ITEMIZED only)
        const exp = expenditures.find(e => e.id === id);
        if (exp?.items && exp.items.length > 0 && campaign?.type === 'ITEMIZED') {
            const itemIds = exp.items.map(item => item.id);
            setLoadingDonationSummary(true);
            try {
                const summary = await paymentService.getDonationSummary(itemIds);
                const map: Record<number, number> = {};
                summary.forEach(s => { map[s.expenditureItemId] = s.donatedQuantity; });
                setDonationSummary(map);
            } catch {
                setDonationSummary({});
            } finally {
                setLoadingDonationSummary(false);
            }
        } else {
            setDonationSummary({});
        }
    };

    const submitWithdrawal = async () => {
        if (!selectedExpId || !evidenceDate) {
            setModalError('Vui lòng chọn hạn nộp minh chứng.');
            return;
        }

        const selectedDate = new Date(evidenceDate);
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        if (selectedDate < now) {
            setModalError('Hạn nộp minh chứng không được ở trong quá khứ.');
            return;
        }

        if (selectedDate > oneMonthLater) {
            setModalError('Hạn nộp minh chứng không được quá 1 tháng kể từ hiện tại.');
            return;
        }

        try {
            setSubmittingWithdrawal(true);
            setModalError(null);

            // Convert to ISO string for backend
            const isoDate = selectedDate.toISOString();
            const updated = await expenditureService.requestWithdrawal(selectedExpId, isoDate);

            setExpenditures(prev => prev.map(exp => exp.id === selectedExpId ? updated : exp));
            setShowWithdrawalModal(false);
            setDonationSummary({});
            toast.success('Yêu cầu rút tiền đã được gửi thành công.');
            setSelectedLogStep(2);
        } catch (err: any) {
            console.error('Withdrawal submission failed:', err);
            setModalError(err.response?.data?.message || 'Yêu cầu rút tiền thất bại.');
        } finally {
            setSubmittingWithdrawal(false);
        }
    };

    const handleEvidenceSubmit = async (expId: number) => {
        if (evidenceFiles.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ảnh minh chứng.');
            return;
        }

        try {
            setUploadingEvidence(true);

            // 1. Upload all to Media Service
            const uploadPromises = evidenceFiles.map(file =>
                mediaService.uploadMedia(
                    file,
                    Number(campaignId),
                    undefined,
                    expId,
                    evidenceDescription || `Minh chứng chi tiêu cho khoản chi #${expId}`,
                    'PHOTO'
                )
            );

            const uploadResults = await Promise.all(uploadPromises);
            const attachments = uploadResults.map(res => ({ type: 'image' as const, url: res.url }));

            // 2. Create Feed Post (Automated reporting)
            await feedPostService.create({
                type: 'POST',
                visibility: 'PUBLIC',
                title: `Cập nhật minh chứng chi tiêu: ${campaign?.title}`,
                content: evidenceDescription || `Tôi vừa cập nhật minh chứng cho hoạt động chi tiêu thuộc chiến dịch "${campaign?.title}". Mời mọi người cùng theo dõi sự minh bạch của dự án!`,
                targetId: Number(campaignId),
                targetType: 'CAMPAIGN',
            } as any);

            // 3. Update status locally in Expenditure
            await expenditureService.updateEvidenceStatus(expId, 'SUBMITTED');

            toast.success('Đã tải lên các minh chứng và tự động đăng bài viết thành công!');

            // Refresh data
            const expendituresData = await expenditureService.getByCampaignId(Number(campaignId));
            setExpenditures(expendituresData);
            setEvidenceFiles([]);
            setEvidenceDescription('');

            // Automatically advance to Step 5
            setSelectedLogStep(5);
        } catch (err: any) {
            console.error('Evidence submission failed:', err);
            toast.error(err.response?.data?.message || 'Không thể tải minh chứng. Vui lòng liên hệ Admin.');
        } finally {
            setUploadingEvidence(false);
        }
    };

    // Open Update Modal (Step 4)
    const handleOpenUpdateModal = async (exp: Expenditure) => {
        try {
            const itemsData = await expenditureService.getItems(exp.id);
            
            // Load donation summary if it's ITEMIZED to compare actual vs received
            if (campaign?.type === 'ITEMIZED') {
                const itemIds = itemsData.map(item => item.id);
                setLoadingDonationSummary(true);
                try {
                    const summaries = await paymentService.getDonationSummary(itemIds);
                    const map: Record<number, number> = {};
                    summaries.forEach(s => {
                        map[s.expenditureItemId] = s.donatedQuantity;
                    });
                    setDonationSummary(map);
                } catch (err) {
                    console.error('Failed to load donation summary:', err);
                    setDonationSummary({});
                } finally {
                    setLoadingDonationSummary(false);
                }
            }

            setUpdateItemsData(itemsData);
            setUpdateExpenditure(exp);
            setUpdateItems(itemsData.map(item => ({
                id: item.id,
                actualQuantity: item.actualQuantity !== undefined ? item.actualQuantity : 0,
                price: item.price !== undefined ? item.price : 0
            })));
            // Clear any pending deletes from previous opens
            setPendingDeleteMediaIds([]);
            // Load media for all items
            itemsData.forEach(item => loadItemMedia(item.id));
            setIsUpdateModalOpen(true);
        } catch (err) {
            toast.error('Không thể tải danh sách vật phẩm.');
        }
    };

    const handleUpdateItemChange = (index: number, field: 'actualQuantity' | 'price', value: string) => {
        const newItems = [...updateItems];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setUpdateItems(newItems);
    };

    const handleUpdateSubmit = async () => {
        if (!updateExpenditure) return;
        try {
            setUpdating(true);

            // 1. Process pending deletions if any
            if (pendingDeleteMediaIds.length > 0) {
                try {
                    await Promise.all(pendingDeleteMediaIds.map(id => mediaService.deleteMedia(id)));
                    setPendingDeleteMediaIds([]);
                } catch (delErr) {
                    console.error('Some media deletions failed during update:', delErr);
                    // We continue anyway so the actuals are saved
                }
            }

            // 2. Update actuals
            await expenditureService.updateActuals(updateExpenditure.id, updateItems);
            toast.success('Cập nhật thành công!');
            setIsUpdateModalOpen(false);

            // Refresh expenditures
            const expendituresData = await expenditureService.getByCampaignId(Number(campaignId));
            setExpenditures(Array.isArray(expendituresData) ? expendituresData : []);
        } catch (err) {
            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    // Load media for a specific expenditure item
    const loadItemMedia = useCallback(async (itemId: number) => {
        if (itemMedia[itemId]) return; // already loaded
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
        if (isDisabled) {
            toast.error('Chiến dịch đã bị vô hiệu hóa, không thể tải lên minh chứng.');
            return;
        }
        setItemUploadState(prev => ({ ...prev, [itemId]: { ...prev[itemId], uploading: true } }));
        try {
            const uploadResults = await Promise.all(
                state.files.map(file =>
                    mediaService.uploadMedia(
                        file,
                        Number(campaignId),
                        undefined,
                        undefined,
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
    }, [itemUploadState, campaignId, isDisabled]);

    // Delete media for a specific item (Deferred to Save)
    const handleDeleteItemMedia = useCallback(async (itemId: number, mediaId: number) => {
        // Just remove from local UI state
        setItemMedia(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || []).filter(m => m.id !== mediaId),
        }));

        // Add to pending deletions for later processing on Save
        setPendingDeleteMediaIds(prev => [...prev, mediaId]);
        toast.success('Đã đánh dấu xóa ảnh minh chứng.');
    }, []);

    // Handle file selection for item media
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
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-400 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error || 'Không tìm thấy chiến dịch'}
                </div>
                <Link href="/account/campaigns" className="mt-4 inline-flex items-center text-[#dc2626] hover:text-red-700 font-bold uppercase tracking-tight text-xs">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chiến dịch
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/account/campaigns" className="inline-flex items-center text-black/40 hover:text-black mb-6 transition-colors text-[10px] font-black uppercase tracking-[2px]">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chiến dịch của tôi
                    </Link>

                    {isDisabled && (
                        <div className="mb-10 p-8 rounded-[3rem] bg-rose-50 border-2 border-rose-100 flex flex-col md:flex-row items-center gap-6 animate-pulse">
                            <div className="w-16 h-16 rounded-[2rem] bg-rose-500 flex items-center justify-center text-white shrink-0">
                                <X className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-rose-950 tracking-tight leading-none mb-2">Chiến dịch đã bị vô hiệu hóa</h2>
                                <p className="text-sm font-bold text-rose-800/60 leading-relaxed">
                                    {campaign.rejectionReason
                                        ? `Lý do: ${campaign.rejectionReason}`
                                        : 'Chiến dịch này đã bị tạm dừng bởi quản trị viên. Bạn không thể tạo khoản chi mới, rút tiền hoặc cập nhật minh chứng cho đến khi trạng thái được khôi phục.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-black tracking-tighter leading-none">{campaign.title}</h1>
                            <p className="mt-3 text-sm font-bold text-black/40 flex items-center">
                                Quản lý chi tiêu cho chiến dịch
                                <span className={`ml-4 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${campaign.type === 'AUTHORIZED'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                    : 'bg-red-50 text-[#dc2626] border-red-100'
                                    }`}>
                                    {campaign.type === 'AUTHORIZED' ? 'Ủy quyền' : 'Tự lập'}
                                </span>
                            </p>
                        </div>
                        {/* Nút Tạo khoản chi mới */}
                        {canCreate ? (
                            <Link
                                href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                                className="inline-flex items-center px-8 py-3 rounded-full shadow-2xl shadow-red-900/10 text-xs font-black uppercase tracking-[1px] text-white bg-red-800 hover:bg-red-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo khoản chi mới
                            </Link>
                        ) : (
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    disabled
                                    className="inline-flex items-center px-8 py-3 rounded-full text-xs font-black uppercase tracking-[1px] text-white bg-gray-300 cursor-not-allowed opacity-60"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tạo khoản chi mới
                                </button>
                                <p className="text-[10px] font-bold text-amber-600 max-w-xs text-right flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                    {blockReason}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats - Claymorphic Redesign */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Balance */}
                    <div className="relative h-[210px] bg-[#2d3a30] rounded-[3.5rem] p-10 flex flex-col justify-end group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                        <div className="absolute top-[-25%] right-[-10%] w-[200px] h-[200px] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
                            <Image src={planeImg} alt="Balance" width={200} height={200} className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
                                {new Intl.NumberFormat('vi-VN').format(campaign.balance)} <span className="text-[12px] align-top opacity-60">VNĐ</span>
                            </h3>
                            <p className="text-[12px] font-black text-white/50 uppercase tracking-[2px]">Số dư hiện tại</p>
                        </div>
                        <div className="absolute bottom-10 right-10">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2d3a30] transform transition-transform group-hover:scale-110">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Count */}
                    <div className="relative h-[210px] bg-[#a8ba9a] rounded-[3.5rem] p-10 flex flex-col justify-end group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#a8ba9a]/20 border border-[#a8ba9a]/50">
                        <div className="absolute top-[-20%] right-[-5%] w-[180px] h-[180px] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 pointer-events-none">
                            <Image src={blocksImg} alt="Expenditures" width={180} height={180} className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-[#2d3a30] tracking-tighter leading-none mb-3">
                                {expenditures.length} <span className="text-[12px] align-top opacity-40">KHOẢN</span>
                            </h3>
                            <p className="text-[12px] font-black text-[#2d3a30]/50 uppercase tracking-[2px]">Tổng khoản chi</p>
                        </div>
                        <div className="absolute bottom-10 right-10">
                            <div className="w-10 h-10 rounded-full bg-[#2d3a30] flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Total Spent */}
                    <div className="relative h-[210px] bg-[#e3dec8] rounded-[3.5rem] p-10 flex flex-col justify-end group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#e3dec8]/20 border border-[#e3dec8]/50">
                        <div className="absolute top-[-20%] right-[-5%] w-[180px] h-[180px] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 pointer-events-none">
                            <Image src={infinityImg} alt="Total Spent" width={180} height={180} className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-[#2d3a30] tracking-tighter leading-none mb-3">
                                {new Intl.NumberFormat('vi-VN').format(totalSpent)} <span className="text-[12px] align-top opacity-40">VNĐ</span>
                            </h3>
                            <p className="text-[12px] font-black text-[#2d3a30]/50 uppercase tracking-[2px]">Tổng tiền đã chi</p>
                        </div>
                        <div className="absolute bottom-10 right-10">
                            <div className="w-10 h-10 rounded-full bg-[#2d3a30] flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Flow Diagrams - Refined Aesthetics */}
                <div className="mb-12">
                    {campaign.type === 'AUTHORIZED' && (
                        <div className="pl-6 pr-10 py-6 bg-white relative group/flow border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row items-center">
                            <div className="w-72 h-72 flex-shrink-0 relative z-20 lg:-ml-14 lg:-mr-16 transition-transform duration-700 group-hover/flow:scale-110 pointer-events-none drop-shadow-2xl">
                                <Image src={flowBgImg} alt="Flow Bg" width={300} height={300} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 relative z-10 py-2">
                                <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-[4px] mb-4 flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100"><Clock className="w-4 h-4" /></span> QUY TRÌNH GIẢI NGÂN (QUỸ ỦY QUYỀN)
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        { title: 'Nhận Donate', desc: 'Ghi nhận & cập nhật số dư' },
                                        { title: 'Gửi yêu cầu', desc: 'Kế hoạch & tiền rút (≤ quỹ)' },
                                        { title: 'Staff duyệt', desc: 'Phê duyệt hoặc Từ chối' },
                                        { title: 'Chuyển tiền', desc: '3 ngày (không tính lễ/tết)' },
                                        { title: 'Up minh chứng', desc: 'Đầy đủ & đúng thời hạn' },
                                    ].map((item, idx, arr) => {
                                        const isActive = idx === 0;
                                        return (
                                            <div
                                                key={idx}
                                                className={`relative flex-1 min-w-[170px] py-6 px-10 transition-all duration-500 overflow-hidden ${isActive ? 'bg-[#1b4332] text-white' : 'bg-[#f4f7f6] text-[#1b4332]'
                                                    }`}
                                                style={{
                                                    clipPath: idx === 0
                                                        ? 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)'
                                                        : idx === arr.length - 1
                                                            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)'
                                                            : 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)',
                                                    marginLeft: idx === 0 ? '0' : '-18px'
                                                }}
                                            >
                                                <div className="relative z-10 flex flex-col items-start ml-2">
                                                    <span className={`text-[13px] font-black leading-tight tracking-tight ${isActive ? 'text-white' : 'text-[#1b4332]'}`}>
                                                        {item.title}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-[1px] mt-1.5 opacity-40 leading-tight`}>
                                                        {item.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {campaign.type === 'ITEMIZED' && (
                        <div className="pl-6 pr-10 py-6 bg-white relative group/flow border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row items-center">
                            <div className="w-72 h-72 flex-shrink-0 relative z-20 lg:-ml-14 lg:-mr-16 transition-transform duration-700 group-hover/flow:scale-110 pointer-events-none drop-shadow-2xl">
                                <Image src={flowBgImg} alt="Flow Bg" width={300} height={300} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 relative z-10 py-2">
                                <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-[4px] mb-4 flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100"><Clock className="w-4 h-4" /></span> QUY TRÌNH GIẢI NGÂN (QUỸ VẬT PHẨM)
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        { title: 'Nhận Donate', desc: 'Ghi nhận & cập nhật số dư' },
                                        { title: 'Gửi yêu cầu', desc: 'Kế hoạch & tiền rút (≤ quỹ)' },
                                        { title: 'Staff duyệt', desc: 'Phê duyệt hoặc Từ chối' },
                                        { title: 'Chuyển tiền', desc: '3 ngày (không tính lễ/tết)' },
                                        { title: 'Up minh chứng', desc: 'Đầy đủ & đúng thời hạn' },
                                    ].map((item, idx, arr) => {
                                        const isActive = idx === 0;
                                        return (
                                            <div
                                                key={idx}
                                                className={`relative flex-1 min-w-[170px] py-6 px-10 transition-all duration-500 overflow-hidden ${isActive ? 'bg-[#1b4332] text-white' : 'bg-[#f4f7f6] text-[#1b4332]'
                                                    }`}
                                                style={{
                                                    clipPath: idx === 0
                                                        ? 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)'
                                                        : idx === arr.length - 1
                                                            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)'
                                                            : 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)',
                                                    marginLeft: idx === 0 ? '0' : '-18px'
                                                }}
                                            >
                                                <div className="relative z-10 flex flex-col items-start ml-2">
                                                    <span className={`text-[13px] font-black leading-tight tracking-tight ${isActive ? 'text-white' : 'text-[#1b4332]'}`}>
                                                        {item.title}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-[1px] mt-1.5 opacity-40 leading-tight`}>
                                                        {item.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Expenditure List */}
                <div className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] rounded-[3rem] border border-black/5 overflow-hidden">
                    <div className="px-10 py-6 border-b border-black/5 bg-white flex justify-between items-center">
                        <h2 className="text-[10px] font-black text-black/30 uppercase tracking-[3px]">Danh sách các khoản chi</h2>
                    </div>

                    {expenditures.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-[2rem] bg-gray-50 text-black/10 mb-6">
                                <FileText className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-black tracking-tight">Chưa có khoản chi nào</h3>
                            <p className="mt-2 text-sm font-bold text-black/30">Bắt đầu bằng cách tạo một khoản chi mới cho chiến dịch này.</p>
                            <div className="mt-10">
                                <Link
                                    href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                                    className="inline-flex items-center px-8 py-3 rounded-full shadow-xl shadow-red-900/5 text-[10px] font-black uppercase tracking-widest text-white bg-red-800 hover:bg-red-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                                    Tạo khoản chi đầu tiên
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full max-h-[500px] overflow-y-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-black/5">
                                    <tr>
                                        <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            STT
                                        </th>
                                        <th scope="col" className="px-10 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Mô tả / Kế hoạch
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Trạng thái
                                        </th>
                                        {campaign.type === 'AUTHORIZED' && (
                                            <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                                Ngày báo cáo
                                            </th>
                                        )}
                                        <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Ngày tạo
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-red-800/80 uppercase tracking-[2px]">
                                            Hành động
                                        </th>
                                        <th scope="col" className="relative px-10 py-5">
                                            <span className="sr-only">Expand</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {expenditures.map((exp) => {
                                        const isExpanded = expandedRowId === exp.id;
                                        return (
                                            <Fragment key={exp.id}>
                                                <tr
                                                    onClick={() => {
                                                        const isNowExpanded = !isExpanded;
                                                        setExpandedRowId(isNowExpanded ? exp.id : null);
                                                        if (isNowExpanded) {
                                                            // Tự động chọn bước phù hợp dựa trên trạng thái
                                                            if (exp.disbursedAt || exp.status === 'DISBURSED') setSelectedLogStep(3);
                                                            else if (exp.isWithdrawalRequested) setSelectedLogStep(2);
                                                            else setSelectedLogStep(1);
                                                        }
                                                    }}
                                                    className={`cursor-pointer transition-[background-color] duration-300 group ${isExpanded ? 'bg-red-50/10' : 'hover:bg-red-50/10 even:bg-slate-50/30'
                                                        }`}
                                                >
                                                    <td className="px-6 py-6 text-center">
                                                        <span className="text-xs font-black text-black/20">{expenditures.indexOf(exp) + 1}</span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className={`text-sm font-black transition-colors ${isExpanded ? 'text-red-900' : 'text-black group-hover:text-red-900'}`}>
                                                            {exp.plan || 'Chi tiêu không tên'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 whitespace-nowrap text-black font-bold">
                                                        {getStatusBadge(exp.status)}
                                                    </td>
                                                    {campaign.type === 'AUTHORIZED' && (
                                                        <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-black/60">
                                                            {exp.evidenceDueAt ? new Date(exp.evidenceDueAt).toLocaleDateString() : '-'}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-black/60">
                                                        {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-3">
                                                            {exp.isWithdrawalRequested ? (
                                                                <span className="text-[10px] font-black uppercase text-red-900 flex items-center gap-1">
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Đã yêu cầu
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {(campaign.type === 'ITEMIZED' && (exp.status === 'APPROVED' || (exp.status as string) === 'CLOSED')) ? (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (isDisabled) {
                                                                                    toast.error('Chiến dịch đã bị vô hiệu hóa, không thể yêu cầu rút tiền.');
                                                                                    return;
                                                                                }
                                                                                handleRequestWithdrawal(exp.id);
                                                                            }}
                                                                            disabled={isDisabled}
                                                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-900 hover:bg-red-900 hover:text-white'}`}
                                                                        >
                                                                            Rút tiền
                                                                        </button>
                                                                    ) : campaign.type === 'AUTHORIZED' ? (
                                                                        exp.status === 'REJECTED' ? (
                                                                            <span className="text-[10px] font-black uppercase text-rose-600 flex items-center gap-1">
                                                                                <X className="w-3.5 h-3.5" /> Kết thúc
                                                                            </span>
                                                                        ) : (
                                                                            <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${isDisabled ? 'text-gray-400' : 'text-amber-600'}`}>
                                                                                <AlertCircle className="w-3.5 h-3.5" /> Chờ báo cáo
                                                                            </span>
                                                                        )
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <ArrowUpRight className={`w-5 h-5 transition-[color,opacity] ${isExpanded ? 'text-red-900' : 'text-black/10 group-hover:text-red-900 opacity-60 group-hover:opacity-100'}`} />
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Content with LOG Timeline */}
                                                <tr>
                                                    <td colSpan={campaign.type === 'AUTHORIZED' ? 6 : 5} className="p-0 border-none relative overflow-hidden">
                                                        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                            <div className="overflow-hidden">
                                                                {isExpanded && (
                                                                    <div className="px-10 py-12 bg-gray-50/30 border-t border-black/5">
                                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                                                            {/* Column 1: MASTER - LOG Timeline (Interactive) */}
                                                                            <div>
                                                                                <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40 mb-10 flex items-center gap-2">
                                                                                    NHẬT KÝ QUY TRÌNH
                                                                                </h4>
                                                                                <div className="relative pl-8 space-y-6">
                                                                                    {/* Vertical Line */}
                                                                                    <div className="absolute left-[3.5px] top-2 bottom-6 w-[2px] bg-gray-100"></div>

                                                                                    {/* Step 1: Tạo khoản chi */}
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setSelectedLogStep(1); }}
                                                                                        className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 1 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                    >
                                                                                        <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 bg-emerald-500 ring-4 ring-emerald-50`}></div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 1 ? 'text-emerald-900' : 'text-emerald-700'}`}>
                                                                                                1. Khởi tạo khoản chi
                                                                                            </span>
                                                                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString('vi-VN') : '—'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </button>

                                                                                    {/* Step 2: Yêu cầu rút tiền */}
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setSelectedLogStep(2); }}
                                                                                        className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 2 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                    >
                                                                                        <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${exp.status === 'REJECTED' ? 'bg-rose-500 ring-4 ring-rose-50' : (exp.isWithdrawalRequested ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50')}`}></div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 2 ? 'text-emerald-900' : (exp.status === 'REJECTED' ? 'text-rose-600' : (exp.status === 'PENDING_REVIEW' && campaign.type === 'AUTHORIZED' ? 'text-amber-500' : (exp.isWithdrawalRequested || (campaign.type === 'AUTHORIZED' && exp.status !== 'PENDING_REVIEW') ? 'text-emerald-700' : 'text-orange-400')))}`}>
                                                                                                2. {exp.status === 'REJECTED' ? 'Bị từ chối' : (campaign.type === 'AUTHORIZED' ? (exp.status === 'PENDING_REVIEW' ? 'Đang xét duyệt' : 'Đã duyệt') : 'Yêu cầu rút tiền')}
                                                                                            </span>
                                                                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                {exp.status === 'REJECTED' ? 'Đã phản hồi' : (campaign.type === 'AUTHORIZED' ? (exp.status === 'PENDING_REVIEW' ? 'Đang xử lý' : 'Đã thực hiện') : (exp.isWithdrawalRequested ? 'Đã thực hiện' : 'Chưa thực hiện'))}
                                                                                            </span>
                                                                                        </div>
                                                                                    </button>

                                                                                    {exp.status !== 'REJECTED' && (
                                                                                        <>
                                                                                            {/* Step 3: Admin chuyển tiền */}
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); setSelectedLogStep(3); }}
                                                                                                className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 3 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                            >
                                                                                                <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${(exp.disbursedAt || exp.status === 'DISBURSED') ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50'}`}></div>
                                                                                                <div className="flex flex-col">
                                                                                                    <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 3 ? 'text-emerald-900' : ((exp.disbursedAt || exp.status === 'DISBURSED') ? 'text-emerald-700' : 'text-orange-400')}`}>
                                                                                                        3. Admin giải ngân
                                                                                                    </span>
                                                                                                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                        {(exp.disbursedAt || exp.status === 'DISBURSED') ? 'Đã chuyển tiền' : 'Đang xử lý'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </button>

                                                                                            {/* Step 4: Minh chứng & Hoàn tiền */}
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); setSelectedLogStep(4); }}
                                                                                                className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 4 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                            >
                                                                                                <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50'}`}></div>
                                                                                                <div className="flex flex-col">
                                                                                                    <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 4 ? 'text-emerald-900' : ((exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'text-emerald-700' : 'text-orange-400')}`}>
                                                                                                        4. Minh chứng & Hoàn tiền
                                                                                                    </span>
                                                                                                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                        {exp.evidenceStatus === 'SUBMITTED' ? 'Đã nộp minh chứng' : exp.evidenceStatus === 'APPROVED' ? 'Đã xác nhận' : exp.evidenceStatus === 'ALLOWED_EDIT' ? 'Cho chỉnh sửa lại' : exp.status === 'DISBURSED' ? 'Cập nhật & Hoàn tiền' : 'Chưa giải ngân'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </button>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 2: DETAIL - Nội dung chi tiết */}
                                                                            <div className="flex flex-col lg:pl-12 lg:border-l border-black/5 min-h-[400px]">
                                                                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                                                                    {selectedLogStep === 1 && (
                                                                                        <div className="space-y-8">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">CHI TIẾT KHỞI TẠO</h4>
                                                                                                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Hoàn tất</span>
                                                                                            </div>
                                                                                            <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
                                                                                                <div>
                                                                                                    <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-2">Mô tả kế hoạch</label>
                                                                                                    <p className="text-sm font-bold text-black leading-relaxed">{exp.plan || 'Không có mô tả'}</p>
                                                                                                </div>
                                                                                                <div className="grid grid-cols-2 gap-6">
                                                                                                    <div>
                                                                                                        <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Ngày tạo</label>
                                                                                                        <p className="text-xs font-bold text-black">{exp.createdAt ? new Date(exp.createdAt).toLocaleString('vi-VN') : '—'}</p>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Staff đảm nhận</label>
                                                                                                        <p className="text-xs font-bold text-black">{staffNameMap[exp.id] || 'Chưa phân công'}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {selectedLogStep === 2 && (
                                                                                        <div className="space-y-8">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">{exp.status === 'REJECTED' ? 'KẾT QUẢ PHẢN HỒI' : (campaign.type === 'AUTHORIZED' && exp.staffReviewId ? 'XÉT DUYỆT CHI TIÊU' : 'YÊU CẦU RÚT TIỀN')}</h4>
                                                                                                {exp.status === 'REJECTED' ? (
                                                                                                    <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-rose-100">Từ chối</span>
                                                                                                ) : (campaign.type === 'AUTHORIZED' && exp.status !== 'PENDING_REVIEW') ? (
                                                                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã duyệt</span>
                                                                                                ) : (campaign.type === 'AUTHORIZED' && exp.status === 'PENDING_REVIEW') ? (
                                                                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">Chờ duyệt</span>
                                                                                                ) : exp.isWithdrawalRequested ? (
                                                                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã gửi</span>
                                                                                                ) : (
                                                                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">Chờ thực hiện</span>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm">
                                                                                                {exp.status === 'REJECTED' ? (
                                                                                                    <div className="space-y-6">
                                                                                                        <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                                                                                            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                                                                                                                <AlertCircle className="w-6 h-6" />
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <p className="text-sm font-black text-rose-900">Yêu cầu bị từ chối</p>
                                                                                                                <p className="text-[10px] font-bold text-rose-700/60 uppercase">Phản hồi vào {exp.updatedAt ? new Date(exp.updatedAt).toLocaleString('vi-VN') : '—'}</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="space-y-4">
                                                                                                            <div>
                                                                                                                <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Lý do từ chối</label>
                                                                                                                <p className="text-sm font-bold text-rose-700 bg-rose-50/50 p-4 rounded-xl border border-rose-100">{exp.rejectReason || 'Không có lý do cụ thể.'}</p>
                                                                                                            </div>
                                                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-tight">
                                                                                                                <User className="w-3.5 h-3.5" />
                                                                                                                <span>Người xét duyệt: {staffNameMap[exp.id] || (exp.staffReviewId ? `Staff #${exp.staffReviewId}` : 'Hệ thống')}</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : (exp.isWithdrawalRequested || (campaign.type === 'AUTHORIZED' && exp.staffReviewId)) ? (
                                                                                                    <div className="space-y-6">
                                                                                                        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${exp.status === 'PENDING_REVIEW' ? 'bg-amber-50 border-amber-100' : 'bg-orange-50 border-emerald-100'}`}>
                                                                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${exp.status === 'PENDING_REVIEW' ? 'bg-amber-400' : 'bg-orange-400'}`}>
                                                                                                                {exp.status === 'PENDING_REVIEW' ? <Clock className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <p className={`text-sm font-black ${exp.status === 'PENDING_REVIEW' ? 'text-amber-900' : 'text-emerald-900'}`}>{campaign.type === 'AUTHORIZED' ? (exp.status === 'PENDING_REVIEW' ? 'Đang được xét duyệt' : 'Khoản chi đã được xét duyệt') : 'Yêu cầu đã được ghi nhận'}</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {campaign.type === 'AUTHORIZED' && exp.staffReviewId && (
                                                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-tight ml-2">
                                                                                                                <User className="w-3.5 h-3.5" />
                                                                                                                <span>Nhân viên duyệt: {staffNameMap[exp.id] || `Staff #${exp.staffReviewId}`}</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <p className="text-sm font-bold text-black/60 leading-relaxed italic">
                                                                                                            {campaign.type === 'AUTHORIZED'
                                                                                                                ? (exp.status === 'PENDING_REVIEW' ? 'Kế hoạch chi tiêu của bạn đang được xét duyệt. Vui lòng đợi kết quả nhé.' : 'Kế hoạch chi tiêu của bạn đã được phê duyệt. Hệ thống đang tiến hành các bước giải ngân.')
                                                                                                                : 'Hệ thống đang chờ Quản trị viên kiểm tra danh sách vật phẩm và thực hiện chuyển khoản vào tài khoản cá nhân của bạn.'}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="text-center py-10 space-y-4">
                                                                                                        <Clock className="w-12 h-12 text-black/10 mx-auto" />
                                                                                                        <p className="text-sm font-bold text-black/40">Khoản chi này chưa đóng hoặc chưa gửi yêu cầu rút tiền.</p>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {selectedLogStep === 3 && (
                                                                                        <div className="space-y-8">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">MINH CHỨNG CHUYỂN KHOẢN</h4>
                                                                                                {exp.status === 'DISBURSED' && (
                                                                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã giải ngân</span>
                                                                                                )}
                                                                                            </div>
                                                                                            {exp.disbursementProofUrl ? (
                                                                                                <div className="space-y-4">
                                                                                                    <a
                                                                                                        href={exp.disbursementProofUrl}
                                                                                                        target="_blank"
                                                                                                        rel="noopener noreferrer"
                                                                                                        className="block relative aspect-[4/3] rounded-[2.5rem] bg-gray-100 border-2 border-white shadow-xl overflow-hidden group/evidence cursor-zoom-in"
                                                                                                    >
                                                                                                        <Image
                                                                                                            src={exp.disbursementProofUrl}
                                                                                                            alt="Minh chứng chuyển khoản"
                                                                                                            fill
                                                                                                            className="object-cover transition-transform duration-500 group-hover/evidence:scale-105"
                                                                                                            unoptimized
                                                                                                        />
                                                                                                        <div className="absolute top-6 right-6 px-3 py-1.5 bg-orange-400 text-white text-[8px] font-black uppercase tracking-widest rounded-xl shadow-lg">Transaction Verified</div>
                                                                                                    </a>
                                                                                                    {exp.disbursedAt && (
                                                                                                        <p className="text-[10px] font-bold text-black/30 italic text-center">
                                                                                                            Thực hiện vào {new Date(exp.disbursedAt).toLocaleString('vi-VN')}
                                                                                                        </p>
                                                                                                    )}
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-black/5 flex flex-col items-center text-center space-y-4">
                                                                                                    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center">
                                                                                                        <FileText className="w-8 h-8 text-black/10" />
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <p className="text-sm font-black text-black/40 uppercase tracking-widest">Chưa có dữ liệu</p>
                                                                                                        <p className="text-[10px] font-bold text-black/20 uppercase mt-2">
                                                                                                            {exp.status === 'DISBURSED'
                                                                                                                ? 'Admin chưa tải lên hình chuyển khoản'
                                                                                                                : 'Chờ admin thực hiện lệnh chuyển tiền'}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                    {selectedLogStep === 4 && (
                                                                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <h4 className="text-[11px] font-black uppercase tracking-[3px] text-orange-900/40">MINH CHỨNG & HOÀN TIỀN</h4>
                                                                                                {(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') && (
                                                                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-orange-100">Đã nộp</span>
                                                                                                )}
                                                                                            </div>

                                                                                            {(exp.evidenceStatus !== 'SUBMITTED' && exp.evidenceStatus !== 'APPROVED') && (
                                                                                                <EvidenceDeadlineBanner dueAt={exp.evidenceDueAt || ''} />
                                                                                            )}

                                                                                            {(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') && (
                                                                                                <div className="flex items-center gap-4 px-6 py-5 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] transition-all duration-500 shadow-sm">
                                                                                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                                                                                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <p className="text-xs font-black text-emerald-900 uppercase tracking-widest leading-none mb-1.5">Đã nộp minh chứng</p>
                                                                                                        {exp.evidenceSubmittedAt && (
                                                                                                            <p className="text-sm font-black text-emerald-800/60">
                                                                                                                Lúc {new Date(exp.evidenceSubmittedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                                                            </p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Phần Minh chứng */}
                                                                                            {(exp.evidenceStatus === 'PENDING' || !exp.evidenceStatus || exp.evidenceStatus === 'ALLOWED_EDIT') && (
                                                                                                <div className="space-y-4">
                                                                                                                                                                                                         {/* Bước 4: Cập nhật thực tế & ảnh */}
                                                                                                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 group/step">
                                                                                                         <div className="flex items-center gap-4">
                                                                                                             {(() => {
                                                                                                                 const isUpdated = (exp.totalAmount || 0) > 0;
                                                                                                                 return (
                                                                                                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isUpdated ? 'bg-emerald-100' : 'bg-white/50'}`}>
                                                                                                                         <Receipt className={`w-5 h-5 ${isUpdated ? 'text-emerald-500' : 'text-orange-400'}`} />
                                                                                                                     </div>
                                                                                                                 );
                                                                                                             })()}
                                                                                                             <div>
                                                                                                                 <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Thực tế & Minh chứng</p>
                                                                                                                 <p className="text-[10px] text-black/40 leading-tight">Cập nhật số lượng, đơn giá thực tế và hóa đơn</p>
                                                                                                             </div>
                                                                                                         </div>
                                                                                                         <button
                                                                                                             onClick={() => handleOpenUpdateModal(exp)}
                                                                                                             className={`px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-full active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${(exp.totalAmount || 0) > 0 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-400 hover:bg-orange-500'}`}
                                                                                                         >
                                                                                                             {(exp.totalAmount || 0) > 0 ? 'Chỉnh sửa' : 'Cập nhật'}
                                                                                                         </button>
                                                                                                     </div>

                                                                                                                                                                                                         {/* Bước 5: Chia sẻ lên bảng tin */}
                                                                                                     {(() => {
                                                                                                         const posts = expenditurePosts[exp.id] || [];
                                                                                                         const publishedPost = posts.find((p: any) => p.status === 'PUBLISHED');
                                                                                                         const draftPost = posts.find((p: any) => p.status === 'DRAFT');
                                                                                                         const isPublished = !!publishedPost;
                                                                                                         const isStepDone = posts.some((p: any) => p.status === 'PUBLISHED' || p.status === 'DRAFT');

                                                                                                         return (
                                                                                                             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 group/step">
                                                                                                                 <div className="flex items-center gap-4">
                                                                                                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isStepDone ? 'bg-emerald-100' : 'bg-white/50'}`}>
                                                                                                                         <ImageIcon className={`w-5 h-5 ${isStepDone ? 'text-emerald-500' : 'text-orange-400'}`} />
                                                                                                                     </div>
                                                                                                                     <div>
                                                                                                                         <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Đăng bài post</p>
                                                                                                                         <p className="text-[10px] text-black/40 leading-tight">
                                                                                                                             {isPublished
                                                                                                                                 ? `Đã đăng lúc ${new Date(publishedPost.updatedAt || publishedPost.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                                                                                                                                 : draftPost
                                                                                                                                     ? 'Bài nháp đang chờ — bấm để tiếp tục sửa'
                                                                                                                                     : 'Chia sẻ minh chứng lên bảng tin để cộng đồng theo dõi'}
                                                                                                                         </p>
                                                                                                                     </div>
                                                                                                                 </div>
                                                                                                                 <button
                                                                                                                     onClick={() => {
                                                                                                                         setCurrentDraftPost(draftPost || publishedPost || null);
                                                                                                                         setPostExpenditure(exp);
                                                                                                                         setIsPostModalOpen(true);
                                                                                                                     }}
                                                                                                                     className={`px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-full active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${isStepDone ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-400 hover:bg-orange-500'}`}
                                                                                                                 >
                                                                                                                     {isPublished ? 'Sửa bài' : draftPost ? 'Tiếp tục' : 'Viết bài'}
                                                                                                                 </button>
                                                                                                             </div>
                                                                                                         );
                                                                                                     })()}

                                                                                                     {/* Phần Hoàn tiền dư (Được dời lên trước nút Nộp) */}
                                                                                                     {exp.status === 'DISBURSED' && (
                                                                                                         <div className="pt-4 border-t border-black/5 space-y-4">
                                                                                                             <div className="flex items-center gap-3">
                                                                                                                 <h4 className="text-[9px] font-black uppercase tracking-[2px] text-orange-900/40">HOÀN TIỀN DƯ</h4>
                                                                                                                 {(() => {
                                                                                                                     const refundTx = exp.transactions?.find((t: any) => t.type === 'REFUND');
                                                                                                                     if (refundTx?.status === 'COMPLETED') {
                                                                                                                         return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[7px] font-black uppercase tracking-widest rounded-full border border-emerald-200">Đã hoàn tất</span>;
                                                                                                                     }
                                                                                                                     if (refundTx) {
                                                                                                                         return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[7px] font-black uppercase tracking-widest rounded-full border border-gray-200 animate-pulse">Đang xử lý</span>;
                                                                                                                     }
                                                                                                                     return null;
                                                                                                                 })()}
                                                                                                             </div>

                                                                                                             {(() => {
                                                                                                                 const refundTx = exp.transactions?.find((t: any) => t.type === 'REFUND' && t.status !== 'FAILED');
                                                                                                                 const variance = (exp.totalExpectedAmount || 0) - (exp.totalAmount || 0);
                                                                                                                 const needRefund = variance > 0;
                                                                                                                 const isRefunded = refundTx?.status === 'COMPLETED';

                                                                                                                 if (refundTx) {
                                                                                                                     return (
                                                                                                                         <div className="space-y-3">
                                                                                                                             <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isRefunded ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-200'}`}>
                                                                                                                                 <div className="flex items-center gap-4">
                                                                                                                                     <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">
                                                                                                                                         <CheckCircle className={`w-5 h-5 ${isRefunded ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                                                                                                     </div>
                                                                                                                                     <div>
                                                                                                                                         <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Hoàn tiền dư</p>
                                                                                                                                         <p className={`text-[10px] font-bold ${isRefunded ? 'text-emerald-600/60' : 'text-amber-600/60'}`}>
                                                                                                                                             Đã hoàn {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundTx.amount)}
                                                                                                                                         </p>
                                                                                                                                     </div>
                                                                                                                                 </div>
                                                                                                                                 {isRefunded ? (
                                                                                                                                     refundTx.proofUrl && (
                                                                                                                                         <div className="w-20 h-14 rounded-xl border border-emerald-100 overflow-hidden shadow-sm hover:scale-105 transition-transform cursor-pointer relative group bg-white p-0.5" onClick={() => { /* Open image zoom */ }}>
                                                                                                                                             <img src={refundTx.proofUrl} alt="Minh chứng hoàn tiền" className="w-full h-full object-cover rounded-lg" />
                                                                                                                                             <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                                                                                 <ImageIcon className="w-4 h-4 text-white drop-shadow-md" />
                                                                                                                                             </div>
                                                                                                                                         </div>
                                                                                                                                     )
                                                                                                                                 ) : (
                                                                                                                                     <button
                                                                                                                                         onClick={() => {
                                                                                                                                             setRefundExpenditure(exp);
                                                                                                                                             setRefundAmount(Math.max(0, variance).toString());
                                                                                                                                             setShowRefundModal(true);
                                                                                                                                         }}
                                                                                                                                         className="px-5 py-2.5 bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-orange-500 active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0"
                                                                                                                                     >
                                                                                                                                         Cập nhật
                                                                                                                                     </button>
                                                                                                                                 )}
                                                                                                                             </div>
                                                                                                                         </div>
                                                                                                                     );
                                                                                                                 }

                                                                                                                 if (!needRefund) {
                                                                                                                     return (
                                                                                                                         <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 flex items-center gap-4">
                                                                                                                             <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">
                                                                                                                                 <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                                                                                                             </div>
                                                                                                                             <div>
                                                                                                                                 <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Không có tiền dư</p>
                                                                                                                                 <p className="text-[10px] text-emerald-600/60 leading-tight">Tuyệt vời! Bạn đã chi tiêu đúng hoặc vượt ngân sách ban đầu.</p>
                                                                                                                             </div>
                                                                                                                         </div>
                                                                                                                     );
                                                                                                                 }

                                                                                                                 return (
                                                                                                                     <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                                                                                                                         <div className="flex items-center gap-4">
                                                                                                                             <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">
                                                                                                                                 <DollarSign className="w-5 h-5 text-orange-400" />
                                                                                                                             </div>
                                                                                                                             <div>
                                                                                                                                 <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Hoàn tiền dư</p>
                                                                                                                                 <p className="text-[10px] text-black/40 leading-tight">Thực hiện hoàn trả số tiền còn dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variance)}</p>
                                                                                                                             </div>
                                                                                                                         </div>
                                                                                                                         <button
                                                                                                                             onClick={() => {
                                                                                                                                 setRefundExpenditure(exp);
                                                                                                                                 setRefundAmount(Math.max(0, variance).toString());
                                                                                                                                 setShowRefundModal(true);
                                                                                                                             }}
                                                                                                                             className="px-5 py-2.5 bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-orange-500 active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0"
                                                                                                                         >
                                                                                                                             Thực hiện
                                                                                                                         </button>
                                                                                                                     </div>
                                                                                                                 );
                                                                                                             })()}
                                                                                                         </div>
                                                                                                     )}

                                                                                                     {/* Nút NỘP FINAL */}
                                                                                                     <div className="flex flex-col gap-3 pt-4 border-t border-black/5">
                                                                                                         {(() => {
                                                                                                             const posts = expenditurePosts[exp.id] || [];
                                                                                                             const isPublished = posts.some((p: any) => p.status === 'PUBLISHED' || p.status === 'DRAFT');
                                                                                                             const isActualsUpdated = (exp.totalAmount || 0) > 0;
                                                                                                             const variance = (exp.totalExpectedAmount || 0) - (exp.totalAmount || 0);
                                                                                                             const needRefund = variance > 0;
                                                                                                             const isRefundDone = exp.transactions?.some((t: any) => t.type === 'REFUND' && t.status === 'COMPLETED');
                                                                                                             
                                                                                                             const isReady = isActualsUpdated && isPublished && (!needRefund || isRefundDone);
                                                                                                             
                                                                                                             const reasons = [];
                                                                                                             if (!isActualsUpdated) reasons.push("Chưa cập nhật số liệu thực tế");
                                                                                                             if (!isPublished) reasons.push("Chưa đăng bài chia sẻ minh chứng");
                                                                                                             if (needRefund && !isRefundDone) reasons.push("Chưa hoàn tất hoàn tiền dư");

                                                                                                             return (
                                                                                                                 <>
                                                                                                                     <button
                                                                                                                         onClick={async () => {
                                                                                                                             if (!isReady) return;
                                                                                                                             try {
                                                                                                                                 setUploadingEvidence(true);
                                                                                                                                 const draftPost = posts.find((p: any) => p.status === 'DRAFT');
                                                                                                                                 if (draftPost) {
                                                                                                                                     await feedPostService.updateStatus(Number(draftPost.id), 'PUBLISHED');
                                                                                                                                 }
                                                                                                                                 await expenditureService.updateEvidenceStatus(exp.id, 'SUBMITTED');
                                                                                                                                 toast.success('Đã nộp minh chứng thành công!');
                                                                                                                                 fetchData();
                                                                                                                             } catch (err: any) {
                                                                                                                                 toast.error(err.response?.data?.message || 'Nộp minh chứng thất bại.');
                                                                                                                             } finally {
                                                                                                                                 setUploadingEvidence(false);
                                                                                                                             }
                                                                                                                         }}
                                                                                                                         disabled={uploadingEvidence || !isReady}
                                                                                                                         className={`w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 ${isReady ? 'bg-orange-400 hover:bg-orange-500' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                                                                                                                     >
                                                                                                                         {uploadingEvidence ? (
                                                                                                                             <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang nộp...</>
                                                                                                                         ) : (
                                                                                                                             <><Send className="w-4 h-4" /> NỘP MINH CHỨNG</>
                                                                                                                         )}
                                                                                                                     </button>
                                                                                                                     {!isReady && (
                                                                                                                         <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                                                                                                             <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                                                                                                 <AlertCircle className="w-3 h-3" /> Cần hoàn thành các bước sau:
                                                                                                                             </p>
                                                                                                                             <ul className="space-y-1">
                                                                                                                                 {reasons.map((r, i) => (
                                                                                                                                     <li key={i} className="text-[9px] font-bold text-amber-600/70 flex items-center gap-2">
                                                                                                                                         <div className="w-1 h-1 rounded-full bg-amber-300" /> {r}
                                                                                                                                     </li>
                                                                                                                                 ))}
                                                                                                                             </ul>
                                                                                                                         </div>
                                                                                                                     )}
                                                                                                                 </>
                                                                                                             );
                                                                                                         })()}
                                                                                                     </div>
                                                                                                  </div>
                                                                                            )}


                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="mt-auto pt-10 border-t border-black/5 flex gap-4">
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); router.push(`/account/campaigns/expenditures/${exp.id}?campaignId=${campaign.id}`); }}
                                                                                        className="flex-1 p-6 rounded-[2rem] bg-black text-white hover:bg-emerald-900 transition-all duration-500 shadow-2xl shadow-black/10 flex items-center justify-between group"
                                                                                    >
                                                                                        <span className="text-[10px] font-black uppercase tracking-[2.5px]">Xem tổng quan đợt chi tiêu </span>
                                                                                        <ArrowUpRight className="w-5 h-5" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Withdrawal Modal */}
                {showWithdrawalModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-10 max-h-[95vh] overflow-y-auto relative no-scrollbar">
                            <h3 className="text-2xl font-black text-black text-center mb-1">Yêu cầu giải ngân</h3>
                            <p className="text-sm text-gray-500 font-bold text-center mb-8">Vui lòng chọn hạn nộp minh chứng chi tiêu</p>

                            {campaign?.type === 'ITEMIZED' && (() => {
                                const exp = expenditures.find(e => e.id === selectedExpId);
                                if (!exp?.items || exp.items.length === 0) return null;
                                return (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-4 px-1">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                                <DollarSign className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DANH SÁCH HẠNG MỤC ({exp.items.length})</h4>
                                        </div>

                                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-white mb-6">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                                        <th className="text-left px-5 py-4 font-black text-slate-400 uppercase text-[9px] tracking-widest">Tên hàng hóa</th>
                                                        <th className="px-3 py-4 font-black text-blue-500/80 uppercase text-[9px] tracking-widest text-center">Kế hoạch</th>
                                                        <th className="px-3 py-4 font-black text-emerald-500/80 uppercase text-[9px] tracking-widest text-center">Đã nhận</th>
                                                        <th className="px-3 py-4 font-black text-orange-500/80 uppercase text-[9px] tracking-widest text-center w-[10%]">%</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        let totalPlanMoney = 0;
                                                        let totalDonatedMoney = 0;
                                                        let totalPlanQty = 0;
                                                        let totalDonatedQty = 0;

                                                        return (
                                                            <>
                                                                {exp.items.map(item => {
                                                                    const donatedQty = donationSummary[item.id] ?? 0;
                                                                    const unitPrice = item.expectedPrice || 0;
                                                                    const planSubtotal = item.quantity * unitPrice;
                                                                    const donatedSubtotal = donatedQty * unitPrice;
                                                                    const percentage = item.quantity > 0 ? Math.min(100, (donatedQty / item.quantity) * 100) : 0;
                                                                    
                                                                    totalPlanMoney += planSubtotal;
                                                                    totalDonatedMoney += donatedSubtotal;
                                                                    totalPlanQty += item.quantity;
                                                                    totalDonatedQty += donatedQty;

                                                                    return (
                                                                        <tr key={item.id} className="border-b border-slate-50 last:border-0 group">
                                                                            <td className="px-5 py-4 align-middle">
                                                                                <div className="font-black text-slate-700 text-[11px] leading-tight break-words max-w-[120px]">{item.category}</div>
                                                                            </td>
                                                                            <td className="px-3 py-4 text-center align-middle">
                                                                                <div className="text-[11px] font-black text-blue-600 leading-none mb-1">
                                                                                    {new Intl.NumberFormat('vi-VN').format(planSubtotal)} <span className="text-[8px] opacity-60">đ</span>
                                                                                </div>
                                                                                <div className="text-[9px] font-bold text-blue-300">
                                                                                    {item.quantity} × {new Intl.NumberFormat('vi-VN').format(unitPrice)} <span className="text-[7px] opacity-40 italic">đ</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-3 py-4 text-center align-middle bg-emerald-50/10">
                                                                                <div className={`text-[11px] font-black leading-none mb-1 ${donatedQty > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                                                    {new Intl.NumberFormat('vi-VN').format(donatedSubtotal)} <span className="text-[8px] opacity-60">đ</span>
                                                                                </div>
                                                                                <div className={`text-[9px] font-bold ${donatedQty > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                                                    {donatedQty} × {new Intl.NumberFormat('vi-VN').format(unitPrice)} <span className="text-[7px] opacity-40 italic">đ</span>
                                                                                    {!loadingDonationSummary && donatedQty === 0 && <span className="block text-[7px] opacity-50 italic font-medium">(Chưa có dữ liệu)</span>}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-3 py-4 text-center align-middle">
                                                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[9px] font-black border-2 ${percentage >= 100 ? 'bg-emerald-500 border-emerald-400 text-white' : percentage > 0 ? 'bg-white border-slate-100 text-slate-400' : 'bg-slate-50 border-transparent text-slate-300'}`}>
                                                                                    {loadingDonationSummary ? '...' : `${Math.round(percentage)}%`}
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                <tr className="bg-slate-50/20 border-t-2 border-slate-100">
                                                                    <td className="px-5 py-4 font-black text-slate-800 text-[11px] uppercase tracking-wide italic">Tổng cộng</td>
                                                                    <td className="px-3 py-4 text-center">
                                                                        <div className="text-[11px] font-black text-blue-700 leading-none mb-1">
                                                                            {new Intl.NumberFormat('vi-VN').format(totalPlanMoney)} <span className="text-[8px] opacity-60">đ</span>
                                                                        </div>
                                                                        <div className="text-[9px] font-bold text-blue-400 whitespace-nowrap">
                                                                            {totalPlanQty} vật phẩm
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 text-center bg-emerald-50/30">
                                                                        <div className="text-[11px] font-black text-emerald-700 leading-none mb-1">
                                                                            {new Intl.NumberFormat('vi-VN').format(totalDonatedMoney)} <span className="text-[8px] opacity-60">đ</span>
                                                                        </div>
                                                                        <div className="text-[9px] font-bold text-emerald-500 whitespace-nowrap">
                                                                            {totalDonatedQty} vật phẩm
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-4 text-center">
                                                                        <div className="text-[10px] font-black text-slate-400">
                                                                            {totalPlanQty > 0 ? Math.round((totalDonatedQty / totalPlanQty) * 100) : 0}%
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        );
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mb-8 p-6 bg-yellow-50/50 border border-yellow-100 rounded-3xl relative">
                                            <p className="text-[11px] font-bold text-yellow-800 text-center leading-relaxed">
                                                Bạn sắp rút <strong className="text-orange-600 font-black">{new Intl.NumberFormat('vi-VN').format(campaign.balance)} đ</strong> cho đợt chi tiêu này. Tại thời điểm này, hệ thống sẽ <span className="text-orange-700 font-black underline underline-offset-2">dừng nhận donation</span> để tiến hành giải ngân.
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="mb-10 px-1">
                                <label className="block text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">HẠN NỘP MINH CHỨNG</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={evidenceDate}
                                        onChange={(e) => {
                                            setEvidenceDate(e.target.value);
                                            setModalError(null);
                                        }}
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all appearance-none"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Clock className="w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            {modalError && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-rose-500 uppercase">{modalError}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={submitWithdrawal}
                                    disabled={submittingWithdrawal}
                                    className="w-full py-4 bg-[#e11d48] text-white text-[11px] font-black uppercase tracking-[2px] rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {submittingWithdrawal && <Loader2 className="w-4 h-4 animate-spin" />}
                                    XÁC NHẬN
                                </button>
                                <button
                                    onClick={() => { setShowWithdrawalModal(false); setDonationSummary({}); }}
                                    disabled={submittingWithdrawal}
                                    className="w-full py-2 text-[10px] font-black uppercase tracking-[2px] text-slate-300 hover:text-slate-500 transition-colors disabled:opacity-50"
                                >
                                    HỦY BỎ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isUpdateModalOpen && updateExpenditure && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsUpdateModalOpen(false)}></div>
                            <div className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all align-middle sm:max-w-5xl sm:w-full max-h-[90vh] flex flex-col">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 shrink-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center gap-2" id="modal-title">
                                            <Receipt className="w-5 h-5 text-emerald-500" />
                                            Cập nhật Thực tế & Minh chứng
                                        </h3>
                                        <button
                                            onClick={() => setIsUpdateModalOpen(false)}
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
                                                    <th className="px-4 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-tighter bg-gray-50">
                                                        {campaign.type === 'ITEMIZED' ? 'Đã nhận' : 'Kế hoạch'}
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
                                                                    <div className="font-bold">{item.category}</div>
                                                                    {item.note && <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{item.note}</div>}
                                                                </td>
                                                                <td className="px-4 py-2 text-right bg-gray-50/50 align-middle">
                                                                    {campaign.type === 'ITEMIZED' ? (
                                                                        <div className="flex items-center justify-end gap-3">
                                                                            <div className="flex items-center gap-1 text-emerald-600">
                                                                                <span className="text-[8px] font-black uppercase tracking-tighter">Đã nhận:</span>
                                                                                <span className="text-xs font-black">{(donationSummary[item.id] || 0)}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-black/40 border-l border-gray-200 pl-3">
                                                                                <span className="text-[8px] font-black uppercase tracking-tighter">ĐG:</span>
                                                                                <span className="text-xs font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}</span>
                                                                            </div>
                                                                            <div className="ml-2 pl-3 border-l-2 border-emerald-300 font-black text-emerald-600 text-sm">
                                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((donationSummary[item.id] || 0) * (item.expectedPrice || 0))}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-end gap-3">
                                                                            <div className="flex items-center gap-1 text-black/40">
                                                                                <span className="text-[8px] font-black uppercase tracking-tighter">SL:</span>
                                                                                <span className="text-xs font-bold">{item.quantity}</span>
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
                                                                                className="w-12 border-gray-200 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-xs font-bold text-right py-0.5 px-1"
                                                                                value={updateItems[index]?.actualQuantity}
                                                                                onChange={(e) => handleUpdateItemChange(index, 'actualQuantity', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                                                            <label className="text-[8px] font-black uppercase tracking-tighter text-gray-400">ĐG:</label>
                                                                            <input
                                                                                type="number" min="0"
                                                                                className="w-24 border-gray-200 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-xs font-bold text-right py-0.5 px-1"
                                                                                value={updateItems[index]?.price}
                                                                                onChange={(e) => handleUpdateItemChange(index, 'price', e.target.value)}
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
                                                    const totalActual = updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0);

                                                    const referenceTotal = isItemized ? totalDonated : totalPlan;
                                                    const totalVariance = referenceTotal - totalActual;
                                                    const budgetLimit = campaign?.type === 'AUTHORIZED' ? (campaign?.balance || 0) : (updateExpenditure.totalExpectedAmount || 0);
                                                    const isOverBudget = totalActual > budgetLimit;

                                                    return (
                                                        <>
                                                            <tr>
                                                                <td className="px-4 py-4 font-black text-gray-900 text-sm">TỔNG CỘNG (INVOICE TOTAL)</td>
                                                                <td className="px-4 py-4 text-right bg-gray-50">
                                                                    <div className="text-[10px] uppercase font-black text-gray-500 mb-0.5">
                                                                        {isItemized ? 'Tổng đã nhận' : 'Tổng Kế hoạch'}
                                                                    </div>
                                                                    <div className={`text-3xl lg:text-4xl font-black ${isItemized ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(referenceTotal)}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-right bg-orange-100/50">
                                                                    <div className="text-[10px] uppercase font-black text-orange-400 mb-0.5 whitespace-nowrap">Tổng Thực tế đã chi</div>
                                                                    <div className={`text-2xl lg:text-3xl font-black ${isOverBudget ? 'text-rose-600' : 'text-emerald-800'}`}>
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalActual)}
                                                                    </div>
                                                                    <div className={`mt-2 p-3 rounded-2xl border-2 ${totalVariance < 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                                                                        <div className="text-[10px] uppercase font-black opacity-40 mb-1">
                                                                            {totalVariance < 0 ? 'CHÚ Ý: Vượt hạn mức chi phí' : 'Số dư cần hoàn'}
                                                                        </div>
                                                                        <div className="text-xl font-black">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalVariance)}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 bg-gray-100"></td>
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
                                </div >
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleUpdateSubmit}
                                        disabled={updating}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:w-auto sm:text-sm ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-400 hover:bg-orange-500 text-white'}`}
                                    >
                                        {updating ? 'Đang lưu...' : 'Lưu cập nhật'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsUpdateModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div >
                        </div >
                    </div >
                )
                }

                {/* Create Post Modal */}
                {
                    (() => {
                        const evidencePhotos = (postExpenditure?.items || [])
                            .flatMap(item => itemMedia[item.id] || [])
                            .map(media => ({ url: media.url, id: media.id, type: 'image' }));

                        return isPostModalOpen && postExpenditure && campaign && (
                            <CreateOrEditPostModal
                                isOpen={isPostModalOpen}
                                onClose={() => { setIsPostModalOpen(false); setPostExpenditure(null); setCurrentDraftPost(null); }}
                                campaignsList={[{ id: campaign.id, title: campaign.title }]}
                                campaignTitlesMap={{ [campaign.id]: campaign.title }}
                                initialData={currentDraftPost ? {
                                    ...currentDraftPost,
                                    attachments: (currentDraftPost.medias && currentDraftPost.medias.length > 0) 
                                        ? currentDraftPost.medias 
                                        : (currentDraftPost.attachments && currentDraftPost.attachments.length > 0)
                                            ? currentDraftPost.attachments
                                            : evidencePhotos,
                                    author: { id: String(currentDraftPost.authorId || ''), name: '', avatar: '' },
                                    liked: false,
                                    comments: [],
                                    likeCount: currentDraftPost.likeCount || 0,
                                    replyCount: currentDraftPost.replyCount || 0,
                                    viewCount: currentDraftPost.viewCount || 0,
                                    isPinned: currentDraftPost.isPinned || false,
                                    isLocked: currentDraftPost.isLocked || false,
                                    flagged: false,
                                } : {
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
                                    title: `Cập nhật minh chứng chi tiêu: ${campaign.title}`,
                                    content: `Tôi vừa hoàn thành chi tiêu cho chiến dịch "${campaign.title}". Mời mọi người cùng theo dõi!`,
                                    type: 'DISCUSSION',
                                    visibility: 'PUBLIC',
                                    status: 'DRAFT',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    targetId: postExpenditure.id,
                                    targetType: 'EXPENDITURE',
                                    attachments: evidencePhotos,
                                }}
                                draftMode={true}
                                onPostCreated={() => {
                                    setIsPostModalOpen(false);
                                    setPostExpenditure(null);
                                    setCurrentDraftPost(null);
                                    fetchData();
                                }}
                                onPostUpdated={() => {
                                    setIsPostModalOpen(false);
                                    setPostExpenditure(null);
                                    setCurrentDraftPost(null);
                                    fetchData();
                                }}
                            />
                        );
                    })()
                }
            </div>

            {
                galleryModalItemId && (
                    <ExpenditureGalleryModal
                        isOpen={!!galleryModalItemId}
                        onClose={() => setGalleryModalItemId(null)}
                        itemName={expenditures.flatMap(e => e.items || []).find(i => i.id === galleryModalItemId)?.category || ''}
                        media={itemMedia[galleryModalItemId] || []}
                        loading={itemMediaLoading[galleryModalItemId]}
                        onDelete={(mediaId) => handleDeleteItemMedia(galleryModalItemId, mediaId)}
                        uploadState={itemUploadState[galleryModalItemId] || { uploading: false, files: [], previews: [] }}
                        onFileChange={(files) => handleItemFileChange(galleryModalItemId, files)}
                        onUploadSubmit={() => handleItemMediaUpload(galleryModalItemId)}
                    />
                )
            }

            {/* Refund Modal */}
            {showRefundModal && refundExpenditure && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowRefundModal(false); setRefundFilePreview(null); setRefundFile(null); }} />
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
                            <button onClick={() => { setShowRefundModal(false); setRefundFilePreview(null); setRefundFile(null); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
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
                            {(() => {
                                const payoutTx = refundExpenditure.transactions?.filter((t: any) => t.type === 'PAYOUT').slice(-1)[0];
                                const userBank = { name: payoutTx?.toAccountHolderName, bank: payoutTx?.toBankCode, account: payoutTx?.toAccountNumber };
                                const adminBank = { name: payoutTx?.fromAccountHolderName, bank: payoutTx?.fromBankCode, account: payoutTx?.fromAccountNumber };
                                return (
                                    <div className="space-y-3">
                                        {/* User (fund owner) — sender of refund */}
                                        <div className="bg-orange-50 rounded-xl p-3.5 border border-orange-200">
                                            <p className="text-[9px] font-black uppercase text-orange-400 tracking-widest mb-2">Người gửi (Chủ quỹ)</p>
                                            {userBank.account ? (
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                    <div><span className="text-gray-400">Ngân hàng: </span><span className="font-bold text-gray-800">{userBank.bank || '—'}</span></div>
                                                    <div><span className="text-gray-400">Số TK: </span><span className="font-bold text-gray-800">{userBank.account}</span></div>
                                                    <div className="col-span-2"><span className="text-gray-400">Chủ TK: </span><span className="font-bold text-gray-800">{userBank.name || '—'}</span></div>
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
                                );
                            })()}

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
                                            onChange={async (e) => {
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
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={() => { setShowRefundModal(false); setRefundFilePreview(null); setRefundFile(null); }}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={refundSubmitting || refundUploading || !refundFilePreview || !refundAmount || refundFilePreview.startsWith('blob:')}
                                onClick={async () => {
                                    if (!refundAmount || Number(refundAmount) <= 0) { toast.error('Số tiền không hợp lệ'); return; }
                                    if (!refundFilePreview || refundFilePreview.startsWith('blob:')) { toast.error('Vui lòng đợi ảnh minh chứng tải lên hoàn tất'); return; }
                                    setRefundSubmitting(true);
                                    try {
                                        await expenditureService.createRefund(
                                            refundExpenditure.id,
                                            Number(refundAmount),
                                            refundFilePreview,
                                            user?.id ? Number(user.id) : undefined
                                        );
                                        toast.success('Đã gửi hoàn tiền dư thành công!');
                                        setShowRefundModal(false);
                                        setRefundFilePreview(null);
                                        setRefundFile(null);
                                        setRefundAmount('');
                                        fetchData();
                                    } catch (err: any) {
                                        toast.error(err.response?.data?.message || 'Gửi hoàn tiền thất bại');
                                    } finally {
                                        setRefundSubmitting(false);
                                    }
                                }}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-400 text-white text-sm font-bold hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow"
                            >
                                {refundSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                                {refundSubmitting ? 'Đang gửi...' : 'Xác nhận hoàn tiền'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

