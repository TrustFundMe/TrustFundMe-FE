'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { mediaService, MediaUploadResponse } from '@/services/mediaService';
import { paymentService } from '@/services/paymentService';
import { feedPostService } from '@/services/feedPostService';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';

export function useExpenditureDetailLogic(id: string, isAuthenticated: boolean, authLoading: boolean) {
    const router = useRouter();

    const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
    const [campaign, setCampaign] = useState<any | null>(null);
    const [items, setItems] = useState<ExpenditureItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [posts, setPosts] = useState<any[]>([]);

    // Update state
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; price: number; }[]>([]);
    const [updating, setUpdating] = useState(false);
    const [pendingDeleteMediaIds, setPendingDeleteMediaIds] = useState<number[]>([]);

    // Item media state
    const [itemMedia, setItemMedia] = useState<Record<number, MediaUploadResponse[]>>({});
    const [itemMediaLoading, setItemMediaLoading] = useState<Record<number, boolean>>({});
    const [itemUploadState, setItemUploadState] = useState<Record<number, { uploading: boolean; files: File[]; previews: string[] }>>({});
    const [galleryModalItemId, setGalleryModalItemId] = useState<number | null>(null);

    const [donationSummary, setDonationSummary] = useState<Record<number, number>>({});
    const [loadingDonationSummary, setLoadingDonationSummary] = useState(false);

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

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const expData = await expenditureService.getById(id);
            setExpenditure(expData);

            if (expData && expData.campaignId) {
                const campaignData = await campaignService.getById(expData.campaignId);
                setCampaign(campaignData);

                const itemsData = await expenditureService.getItems(id);
                const safeItems = Array.isArray(itemsData) ? itemsData : [];
                setItems(safeItems);

                setUpdateItems(safeItems.map(item => ({
                    id: item.id,
                    actualQuantity: item.actualQuantity || 0,
                    price: item.price || 0
                })));

                if (campaignData?.type === 'ITEMIZED' && safeItems.length > 0) {
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

                try {
                    const postData = await feedPostService.getByTarget(Number(id), 'EXPENDITURE');
                    setPosts((postData || []).filter((p: any) => p.targetName?.startsWith('evidence')));
                } catch (postErr) {
                    console.error('Failed to load posts:', postErr);
                }
            }
        } catch (err) {
            console.error('Không thể tải chi tiết khoản chi:', err);
            setError('Không thể tải chi tiết khoản chi.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }
        fetchData();
    }, [id, isAuthenticated, authLoading, router, fetchData]);

    const handleOpenUpdateModal = () => {
        if (items.length > 0) {
            setUpdateItems(items.map(item => ({
                id: item.id,
                actualQuantity: item.actualQuantity !== undefined ? item.actualQuantity : 0,
                price: item.price !== undefined ? item.price : 0
            })));
            setPendingDeleteMediaIds([]);
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
            if (pendingDeleteMediaIds.length > 0) {
                await Promise.all(pendingDeleteMediaIds.map(id => mediaService.deleteMedia(id)));
                setPendingDeleteMediaIds([]);
            }
            await expenditureService.updateActuals(id, updateItems);
            await fetchData();
            setIsUpdateModalOpen(false);
            toast.success('Cập nhật thành công!');
        } catch (err) {
            console.error('Cập nhật thất bại:', err);
            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    const handleRequestWithdrawal = async () => {
        if (!expenditure || !campaign) return;
        const confirmMsg = campaign.type === 'ITEMIZED'
            ? 'Bạn có chắc chắn muốn yêu cầu rút tiền? Hành động này sẽ ĐÓNG đợt chi tiêu này lại.'
            : 'Xác nhận gửi yêu cầu rút tiền cho kế hoạch này?';

        if (!confirm(confirmMsg)) return;

        try {
            setLoading(true);
            const updated = await expenditureService.requestWithdrawal(expenditure.id);
            setExpenditure(updated);
            toast.success('Yêu cầu rút tiền đã được gửi thành công.');
        } catch (err: any) {
            console.error('Yêu cầu rút tiền thất bại:', err);
            toast.error(err.response?.data?.message || 'Yêu cầu rút tiền thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleItemMediaUpload = async (itemId: number) => {
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
    };

    const handleDeleteItemMedia = async (itemId: number, mediaId: number) => {
        setItemMedia(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || []).filter(m => m.id !== mediaId),
        }));
        setPendingDeleteMediaIds(prev => [...prev, mediaId]);
        toast.success('Đã đánh dấu xóa ảnh minh chứng.');
    };

    const handleItemFileChange = (itemId: number, files: FileList | null) => {
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
    };

    const handleExportItems = async () => {
        const XLSX = await import('xlsx');
        const isAuthorized = campaign?.type === 'AUTHORIZED';
        const rows = items.map((item, idx) => {
            const planAmt = (item.quantity || 0) * (item.expectedPrice || 0);
            const receivedAmt = (donationSummary[item.id] || 0) * (item.expectedPrice || 0);
            const actualAmt = (item.actualQuantity || 0) * (item.price || 0);
            return [
                idx + 1,
                item.category || '',
                isAuthorized ? planAmt : receivedAmt,
                actualAmt,
            ];
        });

        const headers = isAuthorized
            ? ['STT', 'Tên hàng hóa', 'Kế hoạch (VNĐ)', 'Thực tế đã chi (VNĐ)']
            : ['STT', 'Tên hàng hóa', 'Tổng quyên góp (VNĐ)', 'Đã chi (VNĐ)'];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 20 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Chi tiêu');
        const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '');
        XLSX.writeFile(wb, `HangMucChi_${today}.xlsx`);
    };

    return {
        expenditure, campaign, items, loading, error, posts, fetchData,
        isUpdateModalOpen, setIsUpdateModalOpen, updateItems, setUpdateItems, updating,
        itemMedia, itemMediaLoading, itemUploadState, setItemUploadState, galleryModalItemId, setGalleryModalItemId,
        donationSummary, loadingDonationSummary,
        handleOpenUpdateModal, handleUpdateItemChange, handleUpdateSubmit, handleRequestWithdrawal,
        handleItemMediaUpload, handleDeleteItemMedia, handleItemFileChange, handleExportItems, loadItemMedia
    };
}
