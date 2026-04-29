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
import AccountCampaignTabbar from '../expenditures/components/AccountCampaignTabbar';
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
    bankAccount: {
        id?: number;
        bankCode: string;
        accountNumber: string;
        accountHolderName: string;
        webhookKey: string;
    };
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
                const [data, cats, goal, campaignBankAccount, mediaRes] = await Promise.all([
                    campaignService.getById(campaignId) as Promise<CampaignDto>,
                    campaignCategoryService.getAll(),
                    campaignService.getActiveGoalByCampaignId(campaignId),
                    bankAccountService.getByCampaignId(campaignId).catch(() => null),
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
                    bankAccount: campaignBankAccount || {
                        bankCode: '',
                        accountNumber: '',
                        accountHolderName: '',
                        webhookKey: ''
                    }
                });
            } catch (error) {
                console.error(error);
                toast('Không thể tải thông tin chiến dịch.', 'error');
            } finally {
                setLoading(false);
                window.scrollTo(0, 0);
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

            // 6. Update/Create Bank Account
            const bankPayload = {
                bankCode: campaign.bankAccount.bankCode,
                accountNumber: campaign.bankAccount.accountNumber,
                accountHolderName: campaign.bankAccount.accountHolderName,
                webhookKey: campaign.bankAccount.webhookKey,
                campaignId: campaignId
            };

            if (campaign.bankAccount.id) {
                await bankAccountService.update(campaign.bankAccount.id, bankPayload);
            } else {
                await bankAccountService.create(bankPayload);
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
            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] h-14">
                <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-base font-bold text-gray-900">Sửa Chiến Dịch</h1>
                    </div>
                    <button
                        onClick={submit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-black transition-all shadow-md shadow-orange-100"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Lưu thay đổi
                    </button>
                </div>
            </header>

            <div className="h-14 w-full" /> {/* Header Spacer */}

            <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">
                <AccountCampaignTabbar campaignId={campaign.id} />
                {campaign.status === 'REJECTED' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-red-900 text-sm">Cần sửa đổi thông tin</h4>
                            <p className="text-red-700 text-sm mt-0.5 leading-snug">"{campaign.rejectionReason}"</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column: Core Info & Goal */}
                    <div className="lg:col-span-2 space-y-6">
                        <FormSectionCard title="Thông tin cơ bản" className="shadow-none border-gray-100">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tiêu đề chiến dịch</label>
                                    <input
                                        type="text"
                                        value={campaign.title}
                                        onChange={(e) => setCampaign(p => p ? ({ ...p, title: e.target.value }) : null)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Danh mục</label>
                                        <select
                                            value={campaign.categoryId}
                                            onChange={(e) => setCampaign(p => p ? ({ ...p, categoryId: parseInt(e.target.value) }) : null)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm font-medium"
                                        >
                                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mục tiêu (VND)</label>
                                        <input
                                            type="number"
                                            value={campaign.targetAmount}
                                            onChange={(e) => setCampaign(p => p ? ({ ...p, targetAmount: parseInt(e.target.value) }) : null)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mô tả chi tiết</label>
                                    <textarea
                                        rows={6}
                                        value={campaign.description}
                                        onChange={(e) => setCampaign(p => p ? ({ ...p, description: e.target.value }) : null)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none text-sm leading-relaxed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lời cảm ơn nhà hảo tâm</label>
                                    <textarea
                                        rows={3}
                                        value={campaign.thankMessage}
                                        onChange={(e) => setCampaign(p => p ? ({ ...p, thankMessage: e.target.value }) : null)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none text-sm leading-relaxed"
                                        placeholder="Nhập lời cảm ơn sẽ hiển thị sau khi họ đóng góp..."
                                    />
                                </div>
                            </div>
                        </FormSectionCard>
                    </div>

                    {/* Right Column: Media & Bank */}
                    <div className="space-y-6">
                        <FormSectionCard title="Hình ảnh & Tài liệu" className="shadow-none border-gray-100">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Ảnh bìa</label>
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 group">
                                        <img src={withFallbackImage(campaign.coverImageUrl, '/assets/img/campaign/1.png')} className="w-full h-full object-cover" alt="Cover" />
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                            <div className="text-center">
                                                <Camera className="w-8 h-8 mx-auto mb-1" />
                                                <span className="text-[10px] font-bold uppercase">Thay đổi</span>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Đính kèm ({campaign.attachments.length})</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {campaign.attachments.map((attr, idx) => {
                                            const isCurrentCover = campaign.coverImageUrl === attr.url;
                                            return (
                                                <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden border ${isCurrentCover ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-100'} group`}>
                                                    <img src={attr.url} className="w-full h-full object-cover" alt="Attachment" />
                                                    <button
                                                        onClick={() => removeAttachment(idx)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded shadow-md hover:bg-red-600 z-10"
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </button>
                                                    {!isCurrentCover && (
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                                            <button
                                                                onClick={() => setAsCover(attr)}
                                                                className="px-2 py-1 bg-white text-gray-900 rounded-md text-[8px] font-bold hover:bg-orange-50"
                                                            >
                                                                Bìa
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-400">
                                            <PlusCircle className="w-5 h-5 mb-1" />
                                            <span className="text-[8px] font-bold">Thêm</span>
                                            <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'attachment')} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </FormSectionCard>

                        <FormSectionCard title="Tài khoản nhận quỹ" className="shadow-none border-gray-100">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Ngân hàng (Mã định danh)</label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: VPB, VCB, MB..."
                                        value={campaign.bankAccount.bankCode}
                                        onChange={(e) => setCampaign(p => p ? ({ ...p, bankAccount: { ...p.bankAccount, bankCode: e.target.value } }) : null)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Số tài khoản</label>
                                    <input
                                        type="text"
                                        value={campaign.bankAccount.accountNumber}
                                        onChange={(e) => setCampaign(p => p ? ({ ...p, bankAccount: { ...p.bankAccount, accountNumber: e.target.value } }) : null)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Tên chủ tài khoản</label>
                                    <input
                                        type="text"
                                        value={campaign.bankAccount.accountHolderName}
                                        onChange={(e) => setCampaign(p => p ? ({ ...p, bankAccount: { ...p.bankAccount, accountHolderName: e.target.value.toUpperCase() } }) : null)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Mã Webhook (Casso Webhook V2)</label>
                                    <input
                                        type="password"
                                        value={campaign.bankAccount.webhookKey}
                                        onChange={(e) => setCampaign(p => p ? ({ ...p, bankAccount: { ...p.bankAccount, webhookKey: e.target.value } }) : null)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-semibold"
                                        placeholder="Để trống nếu không thay đổi"
                                    />
                                </div>
                            </div>
                        </FormSectionCard>

                    </div>
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
