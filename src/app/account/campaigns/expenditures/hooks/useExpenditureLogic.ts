'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { mediaService, MediaUploadResponse } from '@/services/mediaService';
import { feedPostService } from '@/services/feedPostService';
import { paymentService } from '@/services/paymentService';
import { bankAccountService } from '@/services/bankAccountService';
import { chatService } from '@/services/chatService';
import { api } from '@/config/axios';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';
import { BankAccountDto } from '@/types/bankAccount';

export function useExpenditureLogic(campaignId: string | null | undefined, user: any, isAuthenticated: boolean, authLoading: boolean) {
    const router = useRouter();

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
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');

    // Item Media State
    const [itemMedia, setItemMedia] = useState<Record<number, MediaUploadResponse[]>>({});
    const [itemMediaLoading, setItemMediaLoading] = useState<Record<number, boolean>>({});
    const [itemUploadState, setItemUploadState] = useState<Record<number, { uploading: boolean; files: File[]; previews: string[] }>>({});
    const [galleryModalItemId, setGalleryModalItemId] = useState<number | null>(null);

    // Update Modal States
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateExpenditure, setUpdateExpenditure] = useState<Expenditure | null>(null);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; actualPrice: number; actualPurchaseLink?: string; actualBrand?: string }[]>([]);
    const [updateItemsData, setUpdateItemsData] = useState<ExpenditureItem[]>([]);
    const [updating, setUpdating] = useState(false);
    const [pendingDeleteMediaIds, setPendingDeleteMediaIds] = useState<number[]>([]);

    // Staff state
    const [staffNameMap, setStaffNameMap] = useState<Record<number, string>>({});
    const [staffIdMap, setStaffIdMap] = useState<Record<number, number>>({});

    // Post modal state
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postExpenditure, setPostExpenditure] = useState<Expenditure | null>(null);
    const [currentDraftPost, setCurrentDraftPost] = useState<any>(null);
    const [expenditurePosts, setExpenditurePosts] = useState<Record<number, any[]>>({});

    // Refund Modal State
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundExpenditure, setRefundExpenditure] = useState<Expenditure | null>(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [userBankAccounts, setUserBankAccounts] = useState<BankAccountDto[]>([]);

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

    const fetchData = useCallback(async (isSilent = false) => {
        if (!campaignId) return;
        try {
            if (!isSilent) setLoading(true);
            const campaignData = await campaignService.getById(Number(campaignId));
            setCampaign(campaignData);

            const expendituresData = await expenditureService.getByCampaignId(Number(campaignId));
            let exps: any[] = Array.isArray(expendituresData) ? expendituresData : [];

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
                    exps = exps.map((exp: any) => ({ ...exp, items: [] }));
                }
            }

            // Dùng getMyPage để lấy cả bài DRAFT và PUBLISHED
            let myPosts: any[] = [];
            try {
                const myPage = await feedPostService.getMyPage({ status: 'ALL', size: 200 });
                myPosts = myPage.content || [];
            } catch { myPosts = []; }
            
            const postsMap: Record<number, any[]> = {};
            exps.forEach((e: any) => {
                postsMap[e.id] = myPosts.filter((p: any) => {
                    const tName = p.targetName || p.target_name || '';
                    const tType = p.targetType || p.target_type;
                    const tid = p.targetId || p.target_id || p.expenditureId || p.expenditure_id;
                    const isEvidence = tName === 'evidence' || tName.startsWith('evidence|');
                    return isEvidence && tType === 'EXPENDITURE' && Number(tid) === Number(e.id);
                });
            });
            exps.sort((a, b) => b.id - a.id);
            setExpenditurePosts(postsMap);
            setExpenditures(exps);
        } catch (err) {
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

    useEffect(() => {
        if (!isAuthenticated) return;
        bankAccountService.getMyBankAccounts()
            .then(setUserBankAccounts)
            .catch(() => setUserBankAccounts([]));
    }, [isAuthenticated]);

    useEffect(() => {
        expenditures.forEach(exp => {
            exp.items?.forEach(item => {
                loadItemMedia(item.id);
            });
        });
    }, [expenditures, loadItemMedia]);

    useEffect(() => {
        if (!expenditures || expenditures.length === 0) return;
        expenditures.forEach(async (exp) => {
            if (staffNameMap[exp.id] !== undefined) return;
            try {
                const res = await api.get(`/api/admin/tasks/type/EXPENDITURE/target/${exp.id}`);
                const name = res.data?.staffName;
                const staffId = res.data?.staffId;
                if (name) {
                    setStaffNameMap(prev => ({ ...prev, [exp.id]: name }));
                    if (staffId) setStaffIdMap(prev => ({ ...prev, [exp.id]: staffId }));
                } else if (staffId) {
                    setStaffNameMap(prev => ({ ...prev, [exp.id]: `Nhân viên #${staffId}` }));
                    setStaffIdMap(prev => ({ ...prev, [exp.id]: staffId }));
                } else {
                    setStaffNameMap(prev => ({ ...prev, [exp.id]: '' }));
                }
            } catch {
                setStaffNameMap(prev => ({ ...prev, [exp.id]: '' }));
            }
        });
    }, [expenditures, staffNameMap]);

    const handleChatWithStaff = async (expId: number, staffId: number, staffName: string) => {
        if (!user?.id || !campaignId) return;
        try {
            const result = await chatService.createConversation(user.id, Number(campaignId), staffId);
            if (result.success && result.data?.id) {
                router.push(`/account/chat?conversationId=${result.data.id}`);
            } else {
                toast.error(result.error || 'Không thể mở cuộc trò chuyện.');
            }
        } catch {
            toast.error('Lỗi khi mở cuộc trò chuyện với nhân viên.');
        }
    };

    const handleRequestWithdrawal = async (id: number) => {
        setSelectedExpId(id);
        setShowWithdrawalModal(true);
        const exp = expenditures.find(e => e.id === id);
        if (exp?.items && exp.items.length > 0 && campaign?.type === 'ITEMIZED') {
            const itemIds = exp.items.map(item => item.id);
            setLoadingDonationSummary(true);
            try {
                const summary = await paymentService.getDonationSummary(itemIds);
                const map: Record<number, number> = {};
                summary.forEach(s => { map[s.expenditureItemId] = s.donatedQuantity; });
                setDonationSummary(map);
            } finally {
                setLoadingDonationSummary(false);
            }
        }
    };

    const submitWithdrawal = async () => {
        if (!selectedExpId || !evidenceDate) {
            setModalError('Vui lòng chọn hạn nộp minh chứng.');
            return;
        }

        const amountNum = parseFloat(withdrawAmount.replace(/[.,\s]/g, '')) || 0;
        if (amountNum <= 0) {
            setModalError('Vui lòng nhập số tiền hợp lệ.');
            return;
        }

        // Validation based on campaign type
        if (campaign?.type === 'ITEMIZED') {
            const exp = expenditures.find(e => e.id === selectedExpId);
            const items = exp?.items ?? [];
            const currentReceived = items.reduce((sum, item) => {
                const donatedQty = donationSummary[item.id] ?? 0;
                return sum + donatedQty * (item.expectedPrice || 0);
            }, 0);

            if (amountNum < currentReceived) {
                setModalError(`Số tiền rút phải lớn hơn hoặc bằng tổng quyên góp (${new Intl.NumberFormat('vi-VN').format(currentReceived)} đ).`);
                return;
            }
        }

        if (amountNum > (campaign?.balance ?? 0)) {
            setModalError('Số tiền rút không được vượt quá số dư hiện tại của chiến dịch.');
            return;
        }
        try {
            setSubmittingWithdrawal(true);
            const updated = await expenditureService.requestWithdrawal(selectedExpId, new Date(evidenceDate).toISOString(), amountNum);
            setExpenditures(prev => prev.map(exp => exp.id === selectedExpId ? updated : exp));
            setShowWithdrawalModal(false);
            toast.success('Yêu cầu rút tiền đã được gửi thành công.');
        } catch (err: any) {
            setModalError(err.response?.data?.message || 'Yêu cầu rút tiền thất bại.');
        } finally {
            setSubmittingWithdrawal(false);
        }
    };

    const handleOpenUpdateModal = async (exp: Expenditure) => {
        try {
            const itemsData = await expenditureService.getItems(exp.id);
            if (campaign?.type === 'ITEMIZED') {
                setLoadingDonationSummary(true);
                try {
                    const summaries = await paymentService.getDonationSummary(itemsData.map(i => i.id));
                    const map: Record<number, number> = {};
                    summaries.forEach(s => { map[s.expenditureItemId] = s.donatedQuantity; });
                    setDonationSummary(map);
                } finally {
                    setLoadingDonationSummary(false);
                }
            }
            setUpdateItemsData(itemsData);
            setUpdateExpenditure(exp);
            setUpdateItems(itemsData.map(item => ({
                id: item.id,
                actualQuantity: item.actualQuantity ?? 0,
                actualPrice: item.actualPrice ?? 0,
                actualPurchaseLink: item.actualPurchaseLink ?? '',
                actualBrand: item.actualBrand ?? ''
            })));
            setPendingDeleteMediaIds([]);
            itemsData.forEach(item => loadItemMedia(item.id));
            setIsUpdateModalOpen(true);
        } catch {
            toast.error('Không thể tải danh sách vật phẩm.');
        }
    };

    const handleUpdateItemChange = (index: number, field: 'actualQuantity' | 'actualPrice' | 'actualPurchaseLink' | 'actualBrand', value: string) => {
        const newItems = [...updateItems];
        newItems[index] = { ...newItems[index], [field]: (field === 'actualPurchaseLink' || field === 'actualBrand') ? value : Number(value) };
        setUpdateItems(newItems);
    };

    const handleUpdateSubmit = async () => {
        if (!updateExpenditure) return;
        try {
            setUpdating(true);
            await expenditureService.updateActuals(updateExpenditure.id, updateItems);
            toast.success('Cập nhật thành công!');
            setIsUpdateModalOpen(false);
            fetchData();
        } catch {
            toast.error('Cập nhật thất bại.');
        } finally {
            setUpdating(false);
        }
    };

    const handleGalleryFileChange = (itemId: number, files: FileList | null) => {
        if (!files) return;
        const fileList = Array.from(files);
        const previews = fileList.map(file => URL.createObjectURL(file));
        setItemUploadState(prev => ({
            ...prev,
            [itemId]: { uploading: false, files: fileList, previews }
        }));
    };

    const handleGalleryUploadSubmit = async (itemId: number) => {
        const state = itemUploadState[itemId];
        if (!state || state.files.length === 0) return;

        try {
            setItemUploadState(prev => ({
                ...prev,
                [itemId]: { ...state, uploading: true }
            }));

            const results = await Promise.all(
                state.files.map(file => mediaService.uploadMedia(file, undefined, undefined, undefined, undefined, 'PHOTO', undefined, itemId))
            );

            setItemMedia(prev => ({
                ...prev,
                [itemId]: [...(prev[itemId] || []), ...results]
            }));

            setItemUploadState(prev => ({
                ...prev,
                [itemId]: { uploading: false, files: [], previews: [] }
            }));
            
            toast.success(`Đã tải lên ${results.length} ảnh thành công!`);
        } catch (err) {
            toast.error('Tải ảnh lên thất bại.');
        }
    };

    const handleGalleryDeleteMedia = async (itemId: number, mediaId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
        try {
            await mediaService.deleteMedia(mediaId);
            setItemMedia(prev => ({
                ...prev,
                [itemId]: (prev[itemId] || []).filter(m => m.id !== mediaId)
            }));
            toast.success('Đã xóa ảnh.');
        } catch {
            toast.error('Xóa ảnh thất bại.');
        }
    };

    const { withdrawalCount, totalWithdrawnAmount } = useMemo(() => {
        let count = 0;
        let total = 0;
        expenditures.forEach(exp => {
            (exp.evidences || []).forEach(ev => {
                if (ev.amount) {
                    count++;
                    total += Math.abs(ev.amount);
                }
            });
        });
        return { withdrawalCount: count, totalWithdrawnAmount: total };
    }, [expenditures]);

    const totalSpent = useMemo(() => expenditures.reduce((sum, exp) => sum + exp.totalAmount, 0), [expenditures]);

    const { canCreate, blockReason, isDisabled } = useMemo(() => {
        if (!campaign) return { canCreate: true, blockReason: null, isDisabled: false };
        if (campaign.status === 'DISABLED') return { canCreate: false, blockReason: 'Chiến dịch đã bị vô hiệu hóa.', isDisabled: true };
        if (expenditures.length === 0) return { canCreate: true, blockReason: null, isDisabled: false };
        
        // Lấy đợt chi tiêu mới nhất (đã sort desc theo ID ở trên)
        const last = expenditures[0];
        
        // Nếu đợt cuối bị từ chối thì cho phép tạo đợt mới
        if (last.status === 'REJECTED') return { canCreate: true, blockReason: null, isDisabled: false };
        
        // Nếu chưa giải ngân thì không cho tạo đợt mới
        if (last.status !== 'DISBURSED') {
            return { canCreate: false, isDisabled: false, blockReason: 'Khoản chi gần nhất chưa được giải ngân.' };
        }
        
        // Nếu đã giải ngân, phải nộp minh chứng (SUBMITTED hoặc APPROVED) mới được tạo đợt tiếp theo
        const hasEvidence = last.evidenceStatus === 'SUBMITTED' || last.evidenceStatus === 'APPROVED';
        if (!hasEvidence) {
            return { canCreate: false, isDisabled: false, blockReason: 'Khoản chi gần nhất chưa hoàn tất nộp minh chứng.' };
        }
        
        return { canCreate: true, blockReason: null, isDisabled: false };
    }, [campaign, expenditures]);

    return {
        campaign, expenditures, loading, error, fetchData,
        showWithdrawalModal, setShowWithdrawalModal, selectedExpId, setSelectedExpId,
        evidenceDate, setEvidenceDate, modalError, setModalError, submittingWithdrawal,
        donationSummary, loadingDonationSummary, withdrawAmount, setWithdrawAmount,
        itemMedia, itemMediaLoading, itemUploadState, setItemUploadState, galleryModalItemId, setGalleryModalItemId,
        isUpdateModalOpen, setIsUpdateModalOpen, updateExpenditure, setUpdateExpenditure,
        updateItems, setUpdateItems, updateItemsData, updating,
        handleUpdateItemChange, handleUpdateSubmit, handleRequestWithdrawal, submitWithdrawal,
        staffNameMap, staffIdMap, handleChatWithStaff,
        expenditurePosts, isPostModalOpen, setIsPostModalOpen, postExpenditure, setPostExpenditure,
        currentDraftPost, setCurrentDraftPost, handleOpenUpdateModal,
        showRefundModal, setShowRefundModal, refundExpenditure, setRefundExpenditure,
        refundAmount, setRefundAmount, userBankAccounts,
        totalSpent, withdrawalCount, totalWithdrawnAmount, canCreate, blockReason, isDisabled,
        setUserBankAccounts, setExpenditures,
        handleGalleryFileChange, handleGalleryUploadSubmit, handleGalleryDeleteMedia
    };
}

