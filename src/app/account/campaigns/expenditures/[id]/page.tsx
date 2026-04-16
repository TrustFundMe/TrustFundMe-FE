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
        expenditure, campaign, items, loading, error, posts,
        itemMedia, galleryModalItemId, setGalleryModalItemId,
        donationSummary, handleExportItems, loadItemMedia,
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

                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 shrink-0">
                            <img src="/assets/img/logo/white-logo.png" alt="TrustFundMe" className="w-full h-full object-contain scale-110" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-[#1E293B] uppercase tracking-tighter leading-none mb-2">
                                {campaign?.title || campaign?.name || 'Chiến dịch'}
                            </h1>
                            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-wider">
                                <span className="text-[#64748B] flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Tạo: {expenditure.createdAt ? new Date(expenditure.createdAt).toLocaleDateString('vi-VN') : '--'}
                                </span>
                                <span className="text-[#10B981] flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                                    HOÀN THÀNH {Math.round((totalActual / (expenditure.totalExpectedAmount || 1)) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <ExpenditureDetailStats 
                    expenditure={expenditure}
                    totalReceived={totalReceived}
                    totalActual={totalActual}
                    totalBalance={totalBalance}
                />

                {/* Main Table */}
                <ExpenditureDetailItemsTable 
                    items={items}
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

                {/* Link to Evidence Post */}
                <div className="mt-6">
                    {(expenditure.evidenceStatus === 'SUBMITTED' || expenditure.evidenceStatus === 'APPROVED' || expenditure.evidenceStatus === 'ALLOWED_EDIT') && (
                        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-[#10B981] border border-emerald-100">
                                        <CheckCircle className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-[#10B981]">Minh chứng đã xác thực</h3>
                                        <p className="text-[11px] font-bold text-[#64748B]">Bao gồm các bài đăng công khai minh bạch tài chính.</p>
                                    </div>
                                </div>
                            </div>

                            {posts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {posts.map(p => (
                                        <Link
                                            key={p.id}
                                            href={`/post/${p.id}`}
                                            target="_blank"
                                            className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] hover:text-[#3B82F6] hover:border-[#3B82F6]/30 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase tracking-tighter mb-1">Xem bài đăng</span>
                                                <span className="text-[10px] text-[#64748B] font-bold truncate max-w-[200px]">{p.title || 'Chi tiết minh chứng đợt chi'}</span>
                                            </div>
                                            <ArrowLeft className="w-4 h-4 rotate-180 opacity-40 group-hover:opacity-100" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs font-bold text-[#64748B]">
                                    Đã nộp minh chứng tại quầy
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Modal */}
            {galleryModalItemId && (
                <ExpenditureGalleryModal
                    isOpen={!!galleryModalItemId}
                    onClose={() => setGalleryModalItemId(null)}
                    images={activeItemMedia.map(m => ({ url: m.url, alt: 'Minh chứng vật phẩm' }))}
                    initialIndex={0}
                />
            )}
        </div>
    );
}
