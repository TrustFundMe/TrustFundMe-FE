'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { ChevronLeft, Loader2, AlertCircle, Save, Camera, Trash2, PlusCircle, Landmark } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import { campaignService } from '@/services/campaignService';
import { fundraisingGoalService } from '@/services/fundraisingGoalService';
import { bankAccountService } from '@/services/bankAccountService';
import { mediaService } from '@/services/mediaService';
import { campaignCategoryService } from '@/services/campaignCategoryService';
import FormSectionCard from '@/components/campaign/FormSectionCard';
import { CampaignCategory, CampaignDto } from '@/types/campaign';
import { withFallbackImage } from '@/lib/image';

interface Attachment {
    id: number;
    url: string;
    mediaType: string;
    isLocal: boolean;
    file?: File;
}

interface CampaignState {
    id: number;
    title: string;
    description: string;
    categoryId: number;
    thankMessage: string;
    targetAmount: number;
    status: string;
    rejectionReason: string;
    coverImageUrl: string;
    coverImageId?: number;
    coverImageFile?: File;
    attachments: Attachment[];
    bankAccount: any | null;
}

function formatApiError(err: unknown): string {
    const ax = err as AxiosError<any>;
    const status = ax?.response?.status;
    const data = ax?.response?.data;

    if (status === 400 && data?.errors) {
        return Object.values(data.errors).join('. ');
    }
    return data?.message || (ax as any)?.message || 'Lỗi hệ thống, vui lòng thử lại.';
}

function EditCampaignForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [campaign, setCampaign] = useState<CampaignState | null>(null);
    const [categories, setCategories] = useState<CampaignCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/sign-in');
            return;
        }

        if (!id) {
            router.push('/account/campaigns');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const campaignId = parseInt(id);
                const [data, cats, goal, bankAccounts, mediaRes] = await Promise.all([
                    campaignService.getById(campaignId) as Promise<CampaignDto>,
                    campaignCategoryService.getAll(),
                    campaignService.getActiveGoalByCampaignId(campaignId),
                    bankAccountService.getMyBankAccounts(),
                    mediaService.getMediaByCampaignId(campaignId)
                ]);

                if (data.fundOwnerId !== user?.id) {
                    toast('Bạn không có quyền chỉnh sửa chiến dịch này.', 'error');
                    router.push('/account/campaigns');
                    return;
                }

                setCategories(cats);
                setCampaign({
                    id: data.id,
                    title: data.title,
                    description: data.description || '',
                    categoryId: data.categoryId || (typeof data.category === 'object' ? (data.category as any).id : data.category),
                    thankMessage: data.thankMessage || '',
                    targetAmount: goal?.targetAmount || 0,
                    status: data.status,
                    rejectionReason: data.rejectionReason || '',
                    coverImageUrl: data.coverImageUrl || '',
                    coverImageId: data.coverImage || undefined,
                    attachments: mediaRes.map(m => ({
                        id: m.id,
                        url: m.url,
                        mediaType: m.mediaType,
                        isLocal: false
                    })),
                    bankAccount: bankAccounts.length > 0 ? bankAccounts[0] : null
                });
            } catch (error) {
                console.error(error);
                toast('Không thể tải thông tin chiến dịch.', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchData();
    }, [id, user?.id, authLoading, isAuthenticated, toast, router]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'attachment') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (type === 'cover') {
            const file = files[0];
            const localUrl = URL.createObjectURL(file);
            const newAttachment: Attachment = {
                id: Math.random(),
                url: localUrl,
                file,
                mediaType: 'PHOTO',
                isLocal: true
            };
            setCampaign(prev => prev ? ({
                ...prev,
                coverImageUrl: localUrl,
                coverImageFile: file,
                coverImageId: undefined,
                attachments: [...prev.attachments, newAttachment]
            }) : null);
        } else {
            const newAttachments: Attachment[] = Array.from(files).map(file => ({
                id: Math.random(),
                url: URL.createObjectURL(file),
                file,
                mediaType: 'PHOTO',
                isLocal: true
            }));
            setCampaign(prev => prev ? ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }) : null);
        }
    };

    const removeAttachment = (index: number) => {
        if (!campaign) return;
        const attr = campaign.attachments[index];
        if (!attr) return;

        if (!attr.isLocal && attr.id) {
            setDeletedMediaIds(prev => [...prev, attr.id]);
        }

        setCampaign(prev => prev ? ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
            // If the deleted attachment was the cover, reset cover locally
            ...(prev.coverImageUrl === attr.url ? {
                coverImageUrl: '',
                coverImageId: undefined,
                coverImageFile: undefined
            } : {})
        }) : null);
    };

    const setAsCover = (attr: Attachment) => {
        if (!campaign) return;
        setCampaign(prev => prev ? ({
            ...prev,
            coverImageUrl: attr.url,
            coverImageId: attr.isLocal ? undefined : attr.id,
            coverImageFile: attr.file
        }) : null);
        toast('Đã thay đổi ảnh bìa', 'success');
    };

    const submit = async () => {
        if (!campaign) return;
        setIsSubmitting(true);
        const initialStatus = campaign.status;

        try {
            const campaignId = campaign.id;

            // 1. Process Batch Deletions
            for (const mediaId of deletedMediaIds) {
                try {
                    await mediaService.deleteMedia(mediaId);
                } catch (e) {
                    console.error('Failed to delete media:', mediaId, e);
                }
            }

            // 2. Upload Cover if changed
            let finalCoverId = campaign.coverImageId;
            let uploadedCoverFile: File | undefined = undefined;

            if (campaign.coverImageFile) {
                const res = await mediaService.uploadMedia(campaign.coverImageFile, campaignId, undefined, undefined, undefined, 'PHOTO');
                finalCoverId = res.id;
                uploadedCoverFile = campaign.coverImageFile;
            }

            // 3. Upload New Attachments
            for (let i = 0; i < campaign.attachments.length; i++) {
                const attr = campaign.attachments[i];
                if (attr.isLocal && attr.file) {
                    // Skip if this file was already uploaded as the cover image
                    if (attr.file === uploadedCoverFile) continue;
                    await mediaService.uploadMedia(attr.file, campaignId);
                }
            }

            // 4. Update Text Content
            await campaignService.update(campaignId, {
                title: campaign.title,
                description: campaign.description,
                categoryId: campaign.categoryId,
                thankMessage: campaign.thankMessage,
                coverImage: finalCoverId,
                status: 'PENDING_APPROVAL',
            });

            // 5. Update Goal
            const existingGoals = await fundraisingGoalService.getByCampaignId(campaignId);
            if (existingGoals.length > 0) {
                await fundraisingGoalService.update(existingGoals[0].id, { targetAmount: campaign.targetAmount });
            }

            const successMsg = initialStatus === 'REJECTED'
                ? 'Chiến dịch của bạn đã được cập nhật và gửi duyệt lại.'
                : 'Cập nhật chỉnh sửa thành công';

            toast(successMsg, 'success');
            router.push('/account/campaigns');
        } catch (err) {
            toast(formatApiError(err), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !campaign) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Sửa chiến dịch</h1>
                    </div>
                    <button
                        onClick={submit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 font-bold transition-all shadow-lg shadow-orange-100"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu thay đổi
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {campaign.status === 'REJECTED' && (
                    <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex gap-4">
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-900">Chiến dịch không được duyệt</h4>
                            <p className="text-red-700 text-sm mt-1 leading-relaxed">"{campaign.rejectionReason}"</p>
                            <p className="mt-3 text-xs font-bold text-red-600 uppercase tracking-widest">Vui lòng sửa thông tin và gửi lại</p>
                        </div>
                    </div>
                )}

                <FormSectionCard title="Thông tin cơ bản" subtitle="Tiêu đề và lĩnh vực hoạt động của chiến dịch">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề chiến dịch</label>
                            <input
                                type="text"
                                value={campaign.title}
                                onChange={(e) => setCampaign(p => p ? ({ ...p, title: e.target.value }) : null)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                            <select
                                value={campaign.categoryId}
                                onChange={(e) => setCampaign(p => p ? ({ ...p, categoryId: parseInt(e.target.value) }) : null)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                            >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                            <textarea
                                rows={8}
                                value={campaign.description}
                                onChange={(e) => setCampaign(p => p ? ({ ...p, description: e.target.value }) : null)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>
                </FormSectionCard>

                <FormSectionCard title="Mục tiêu tài chính" subtitle="Số tiền dự kiến cần huy động cho chiến dịch">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số tiền mục tiêu (VND)</label>
                            <input
                                type="number"
                                value={campaign.targetAmount}
                                onChange={(e) => setCampaign(p => p ? ({ ...p, targetAmount: parseInt(e.target.value) }) : null)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div className="pt-8 text-gray-400 text-sm hidden md:block">~ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign.targetAmount)}</div>
                    </div>
                </FormSectionCard>

                <FormSectionCard title="Hình ảnh & Tài liệu" subtitle="Ảnh bìa và các minh chứng liên quan">
                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4">Ảnh bìa chính</label>
                            <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 group">
                                <img src={withFallbackImage(campaign.coverImageUrl, '/assets/img/campaign/1.png')} className="w-full h-full object-cover" alt="Cover" />
                                {campaign.coverImageUrl && (
                                    <button
                                        onClick={() => setCampaign(p => p ? ({ ...p, coverImageUrl: '', coverImageId: undefined, coverImageFile: undefined }) : null)}
                                        className="absolute top-3 right-3 p-1.5 bg-red-600/90 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all z-20"
                                        title="Gỡ ảnh bìa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-10">
                                    <div className="text-center">
                                        <Camera className="w-10 h-10 mx-auto mb-2" />
                                        <span className="font-bold">Thay đổi ảnh bìa</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4">Tài liệu đính kèm ({campaign.attachments.length})</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {campaign.attachments.map((attr, idx) => {
                                    const isCurrentCover = campaign.coverImageUrl === attr.url;
                                    return (
                                        <div key={idx} className={`relative aspect-square rounded-2xl overflow-hidden border ${isCurrentCover ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-100'} group`}>
                                            <img src={attr.url} className="w-full h-full object-cover" alt="Attachment" />

                                            {/* Delete Action (Always Visible) */}
                                            <button
                                                onClick={() => removeAttachment(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all z-10"
                                                title="Xóa tệp"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>

                                            {/* Set as Cover Action (On Hover) */}
                                            {!isCurrentCover && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                                    <button
                                                        onClick={() => setAsCover(attr)}
                                                        className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-[10px] font-bold shadow-xl hover:bg-orange-50 transition-colors"
                                                    >
                                                        Đặt làm bìa
                                                    </button>
                                                </div>
                                            )}

                                            {isCurrentCover && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded-full uppercase tracking-tighter">
                                                    Ảnh bìa
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-400">
                                    <PlusCircle className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-bold">Thêm tệp</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'attachment')} />
                                </label>
                            </div>
                        </div>
                    </div>
                </FormSectionCard>

                <FormSectionCard title="Tài khoản nhận quỹ" subtitle="Thông tin ngân hàng để giải ngân khi hoàn thành">
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Tài khoản hiện tại</p>
                            <h4 className="font-bold text-gray-900 text-lg">{campaign.bankAccount?.accountHolderName || 'Chưa thiết lập'}</h4>
                            <p className="text-gray-500 text-sm">{campaign.bankAccount?.bankCode} • {campaign.bankAccount?.accountNumber}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 font-medium italic">Để thay đổi tài khoản nhận quỹ, vui lòng cập nhật trong phần Cài đặt tài khoản.</p>
                </FormSectionCard>

                <div className="pt-8 flex justify-center">
                    <button
                        onClick={submit}
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-12 py-4 bg-orange-600 text-white rounded-2xl font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Cập nhật và Gửi duyệt lại
                    </button>
                </div>
            </main>
        </div>
    );
}

export default function EditCampaignPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div>}>
            <EditCampaignForm />
        </Suspense>
    );
}
