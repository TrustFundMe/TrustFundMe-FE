'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, Receipt, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useExpenditureDetailLogic } from './hooks/useExpenditureDetailLogic';
import ExpenditureDetailStats from './components/ExpenditureDetailStats';
import ExpenditureDetailItemsTable from './components/ExpenditureDetailItemsTable';
import ExpenditureGalleryModal from '@/components/campaign/ExpenditureGalleryModal';

export default function ExpenditureDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { isAuthenticated, loading: authLoading } = useAuth();
    const {
        expenditure, campaign, items, categories, loading, error, posts,
        itemMedia, galleryModalItemId, setGalleryModalItemId,
        donationSummary, handleExportItems, loadItemMedia,
        handleItemMediaUpload, handleDeleteItemMedia, handleItemFileChange, itemUploadState
    } = useExpenditureDetailLogic(id, isAuthenticated, authLoading);

    const totalActual = useMemo(() => items.reduce((sum, item) => sum + ((item.actualQuantity || 0) * (item.price || 0)), 0), [items]);
    const totalReceived = useMemo(() => (expenditure?.totalReceivedAmount != null) ? Number(expenditure.totalReceivedAmount) : 0, [expenditure]);
    const totalBalance = useMemo(() => (expenditure?.variance != null) ? Number(expenditure.variance) : 0, [expenditure]);
    const totalPlan = useMemo(() => items.reduce((sum, item) => sum + (item.quantity || 0) * (item.expectedPrice || 0), 0), [items]);

    const activeItemMedia = useMemo(() => galleryModalItemId ? (itemMedia[galleryModalItemId] || []) : [], [galleryModalItemId, itemMedia]);

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
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
            <div className="max-w-[1500px] mx-auto px-4 pt-2 pb-4">
                {/* Navigation */}
                <div className="mb-2">
                    <Link 
                        href={`/account/campaigns/expenditures?campaignId=${expenditure.campaignId}`} 
                        className="inline-flex items-center text-[#64748B] hover:text-[#1E293B] transition-colors text-[10px] font-black uppercase tracking-[2px]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại quản lý chi tiêu
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
                    {/* Header Left: Logo, Title, Description */}
                    <div className="flex flex-col lg:max-w-[400px]">
                        <h1 className="text-lg font-black text-[#1E293B] uppercase tracking-tighter leading-tight mb-1 line-clamp-1">
                            {campaign?.title || campaign?.name || 'Chiến dịch'}
                        </h1>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold text-[#1E293B] leading-snug line-clamp-3">{expenditure?.plan || 'Khoản chi tiêu đợt 1'}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748B]">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>Thời gian tạo: {expenditure.createdAt ? new Date(expenditure.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Header Right: Stats Cards */}
                    <div className="flex-1">
                        <ExpenditureDetailStats 
                            expenditure={expenditure}
                            totalReceived={totalReceived}
                            totalActual={totalActual}
                            totalBalance={totalBalance}
                            posts={posts}
                        />
                    </div>
                </div>

                {/* Main Table */}
                <ExpenditureDetailItemsTable
                    items={items}
                    categories={categories}
                    campaign={campaign}
                    itemMedia={itemMedia}
                    donationSummary={donationSummary}
                    handleExportItems={handleExportItems}
                    setGalleryModalItemId={setGalleryModalItemId}
                    loadItemMedia={loadItemMedia}
                    totalPlan={totalPlan}
                    totalActual={totalActual}
                    totalReceived={totalReceived}
                    expenditure={expenditure}
                />


            </div>

            {/* Gallery Modal */}
            {galleryModalItemId && (
                <ExpenditureGalleryModal
                    isOpen={!!galleryModalItemId}
                    onClose={() => setGalleryModalItemId(null)}
                    itemName={items.find(i => i.id === galleryModalItemId)?.category || 'Vật phẩm'}
                    media={itemMedia[galleryModalItemId] || []}
                    onFileChange={(files) => handleItemFileChange(galleryModalItemId, files)}
                    onUploadSubmit={() => handleItemMediaUpload(galleryModalItemId)}
                    uploadState={itemUploadState[galleryModalItemId] || { uploading: false, files: [], previews: [] }}
                    onDelete={(mediaId) => handleDeleteItemMedia(galleryModalItemId, mediaId)}
                />
            )}
        </div>
    );
}
