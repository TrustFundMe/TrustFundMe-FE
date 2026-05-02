'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, AlertCircle, X, HelpCircle, Loader2 } from 'lucide-react';
import { useState, Suspense } from 'react';
import CreateOrEditPostModal from '@/components/feed-post/CreateOrEditPostModal';

import ExpenditureStats from './components/ExpenditureStats';
import ExpenditureProcessFlow from './components/ExpenditureProcessFlow';
import ExpenditureTable from './components/ExpenditureTable';
import AccountCampaignTabbar from './components/AccountCampaignTabbar';
import UpdateExpenditureModal from './components/UpdateExpenditureModal';
import RefundExpenditureModal from './components/RefundExpenditureModal';
import WithdrawalModal from '@/components/campaign/WithdrawalModal';
import ExpenditureGalleryModal from '@/components/campaign/ExpenditureGalleryModal';

import { useAuth } from '@/contexts/AuthContextProxy';
import { useExpenditureLogic } from './hooks/useExpenditureLogic';
import { expenditureService } from '@/services/expenditureService';
import { toast } from 'react-hot-toast';

export default function CampaignExpendituresPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-white">
                <Loader2 className="w-10 h-10 text-rose-400 animate-spin" />
            </div>
        }>
            <CampaignExpendituresContent />
        </Suspense>
    );
}

function CampaignExpendituresContent() {
    const searchParams = useSearchParams();
    const campaignId = searchParams?.get('campaignId');
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const {
        campaign, expenditures, loading, error, fetchData,
        showWithdrawalModal, setShowWithdrawalModal, selectedExpId,
        evidenceDate, setEvidenceDate, modalError, setModalError, submittingWithdrawal,
        donationSummary, loadingDonationSummary, withdrawAmount, setWithdrawAmount,
        itemMedia, setIsUpdateModalOpen, isUpdateModalOpen, updateExpenditure,
        updateItems, updateItemsData, updating,
        handleUpdateItemChange, handleUpdateSubmit, handleRequestWithdrawal, submitWithdrawal,
        staffNameMap, staffIdMap, handleChatWithStaff,
        expenditurePosts, isPostModalOpen, setIsPostModalOpen, postExpenditure, setPostExpenditure,
        currentDraftPost, setCurrentDraftPost, handleOpenUpdateModal,
        showRefundModal, setShowRefundModal, refundExpenditure, setRefundExpenditure,
        refundAmount, setRefundAmount, userBankAccounts,
        totalSpent, withdrawalCount, totalWithdrawnAmount, canCreate, blockReason, isDisabled, setGalleryModalItemId,
        handleGalleryFileChange, handleGalleryUploadSubmit, handleGalleryDeleteMedia,
        itemUploadState, galleryModalItemId
    } = useExpenditureLogic(campaignId, user, isAuthenticated, authLoading);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

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

    const isRefundDone = updateExpenditure?.transactions?.some((t: any) => t.type === 'REFUND' && t.status === 'COMPLETED');

    return (
        <div className="min-h-screen bg-white pt-4 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-2">
                    <Link href="/account/campaigns" className="inline-flex items-center text-black/40 hover:text-black mb-1 transition-colors text-[10px] font-black uppercase tracking-[2px]">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chiến dịch của tôi
                    </Link>

                    {isDisabled && campaign.status === 'DISABLED' && (
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
                            <AccountCampaignTabbar campaignId={campaign.id} />
                            <div className="flex items-center gap-4 mt-1">
                                <h1 className="text-2xl font-black text-black tracking-tighter leading-none">
                                    {campaign.type === 'AUTHORIZED' ? campaign.title : `Chiến dịch: ${campaign.title}`}
                                </h1>
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 uppercase tracking-widest">
                                    {campaign.type === 'AUTHORIZED' ? 'Quỹ ủy quyền' : 'Quỹ vật phẩm'}
                                </span>
                                <button
                                    onClick={() => setIsProcessModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[#1b4332] text-[9px] font-black uppercase tracking-wider hover:bg-slate-100 transition-all"
                                >
                                    <HelpCircle className="w-3 h-3" />
                                    Quy trình giải ngân
                                </button>
                            </div>
                        </div>

                        {/* Nút Tạo khoản chi mới */}
                        {canCreate ? (
                            <Link
                                href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                                className="inline-flex items-center px-8 py-3 rounded-full shadow-2xl shadow-red-900/10 text-xs font-black uppercase tracking-[1px] text-white bg-red-800 hover:bg-red-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo đợt chi tiêu mới
                            </Link>
                        ) : (
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    disabled
                                    className="inline-flex items-center px-8 py-3 rounded-full text-xs font-black uppercase tracking-[1px] text-white bg-gray-300 cursor-not-allowed opacity-60"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tạo đợt chi tiêu mới
                                </button>
                                <p className="text-[10px] font-bold text-amber-600 max-w-xs text-right flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                    {blockReason}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <ExpenditureStats
                    campaignId={campaign.id}
                    balance={campaign.balance}
                    withdrawalCount={withdrawalCount}
                    totalWithdrawnAmount={totalWithdrawnAmount}
                />

                {/* Expenditure List */}
                <ExpenditureTable
                    expenditures={expenditures}
                    campaign={campaign}
                    isDisabled={isDisabled}
                    staffNameMap={staffNameMap}
                    staffIdMap={staffIdMap}
                    expenditurePosts={expenditurePosts}
                    handleRequestWithdrawal={handleRequestWithdrawal}
                    handleChatWithStaff={handleChatWithStaff}
                    setCurrentDraftPost={setCurrentDraftPost}
                    setPostExpenditure={setPostExpenditure}
                    setIsPostModalOpen={setIsPostModalOpen}
                    setRefundExpenditure={setRefundExpenditure}
                    setRefundAmount={setRefundAmount}
                    setShowRefundModal={setShowRefundModal}
                    handleOpenUpdateModal={handleOpenUpdateModal}
                    fetchData={fetchData}
                />

                {/* Modals */}
                {showWithdrawalModal && (
                    <WithdrawalModal
                        show={showWithdrawalModal}
                        campaign={campaign as any}
                        selectedExp={expenditures.find(e => e.id === selectedExpId) ?? null}
                        donationSummary={donationSummary}
                        loadingDonationSummary={loadingDonationSummary}
                        withdrawAmount={withdrawAmount}
                        onWithdrawAmountChange={(val) => setWithdrawAmount(val)}
                        evidenceDate={evidenceDate}
                        onEvidenceDateChange={(val) => setEvidenceDate(val)}
                        modalError={modalError}
                        submittingWithdrawal={submittingWithdrawal}
                        onSubmit={submitWithdrawal}
                        onClose={() => setShowWithdrawalModal(false)}
                    />
                )}

                {isUpdateModalOpen && updateExpenditure && (
                    <UpdateExpenditureModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        campaign={campaign as any}
                        updateExpenditure={updateExpenditure}
                        updateItemsData={updateItemsData}
                        updateItems={updateItems}
                        itemMedia={itemMedia}
                        donationSummary={donationSummary}
                        isRefundDone={!!isRefundDone}
                        handleUpdateItemChange={handleUpdateItemChange}
                        handleUpdateSubmit={handleUpdateSubmit}
                        updating={updating}
                        setGalleryModalItemId={setGalleryModalItemId}
                        expenditures={expenditures}
                        setIsPostModalOpen={setIsPostModalOpen}
                        setPostExpenditure={setPostExpenditure}
                        setCurrentDraftPost={setCurrentDraftPost}
                        fetchData={fetchData}
                    />
                )}

                {isPostModalOpen && postExpenditure && campaign && (
                    <CreateOrEditPostModal
                        isOpen={isPostModalOpen}
                        onClose={() => { setIsPostModalOpen(false); setPostExpenditure(null); setCurrentDraftPost(null); }}
                        campaignsList={[{ id: campaign.id, title: campaign.title }]}
                        campaignTitlesMap={{ [campaign.id]: campaign.title }}
                        initialData={currentDraftPost ? (() => {
                            // Normalize keys from snake_case to camelCase just in case
                            const p = currentDraftPost;
                            const normalized = {
                                ...p,
                                targetId: p.targetId ?? p.target_id ?? p.expenditureId ?? p.expenditure_id,
                                targetType: p.targetType ?? p.target_type,
                                targetName: p.targetName ?? p.target_name,
                                authorId: p.authorId ?? p.author_id,
                                likeCount: p.likeCount ?? p.like_count,
                                replyCount: p.replyCount ?? p.reply_count,
                                viewCount: p.viewCount ?? p.view_count,
                                isPinned: p.isPinned ?? p.is_pinned,
                                isLocked: p.isLocked ?? p.is_locked,
                            };
                            return {
                                ...normalized,
                                attachments: normalized.attachments || [],
                                author: { id: String(normalized.authorId || ''), name: '', avatar: '' },
                                liked: false,
                                comments: [],
                            };
                        })() : {
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
                            status: 'PUBLISHED',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            targetId: postExpenditure.id,
                            targetType: 'EXPENDITURE',
                            targetName: 'Minh chứng giải ngân',
                            attachments: [],
                        }}
                        draftMode={false}
                        onPostCreated={async (newPost) => {
                            if (newPost && currentDraftPost?._evidenceId) {
                                const evidenceId = Number(currentDraftPost._evidenceId);
                                if (evidenceId) {
                                    try {
                                        const proofUrl = `${window.location.origin}/post/${newPost.id}`;
                                        await expenditureService.submitEvidence(evidenceId, proofUrl);
                                        toast.success('Đã nộp minh chứng thành công!');
                                    } catch (err) {
                                        console.error('Error linking evidence:', err);
                                        toast.error('Lỗi khi liên kết minh chứng!');
                                    }
                                }
                            }
                            setIsPostModalOpen(false);
                            setPostExpenditure(null);
                            setCurrentDraftPost(null);
                            fetchData();
                        }}
                        onPostUpdated={async (updatedPost) => {
                            if (updatedPost && currentDraftPost?._evidenceId) {
                                const evidenceId = Number(currentDraftPost._evidenceId);
                                if (evidenceId) {
                                    try {
                                        const proofUrl = `${window.location.origin}/post/${updatedPost.id}`;
                                        await expenditureService.submitEvidence(evidenceId, proofUrl);
                                    } catch (err) {
                                        console.error('Error linking evidence on update:', err);
                                    }
                                }
                            }
                            setIsPostModalOpen(false);
                            setPostExpenditure(null);
                            setCurrentDraftPost(null);
                            fetchData();
                        }}
                    />
                )}

                {showRefundModal && refundExpenditure && (
                    <RefundExpenditureModal
                        isOpen={showRefundModal}
                        onClose={() => { setShowRefundModal(false); setRefundExpenditure(null); }}
                        refundExpenditure={refundExpenditure}
                        refundAmount={refundAmount}
                        userBankAccounts={userBankAccounts}
                        onSuccess={() => { setShowRefundModal(false); fetchData(); }}
                    />
                )}

                {galleryModalItemId && (
                    <ExpenditureGalleryModal
                        isOpen={!!galleryModalItemId}
                        onClose={() => setGalleryModalItemId(null)}
                        itemName={
                            updateItemsData.find(i => i.id === galleryModalItemId)?.name ||
                            expenditures.flatMap(e => e.items || []).find(i => i.id === galleryModalItemId)?.name ||
                            'Vật phẩm'
                        }
                        media={itemMedia[galleryModalItemId] || []}
                        onFileChange={(files) => handleGalleryFileChange(galleryModalItemId, files)}
                        onUploadSubmit={() => handleGalleryUploadSubmit(galleryModalItemId)}
                        uploadState={itemUploadState[galleryModalItemId] || { uploading: false, files: [], previews: [] }}
                        onDelete={(mediaId) => handleGalleryDeleteMedia(galleryModalItemId, mediaId)}
                    />
                )}

                {/* Process Flow Modal */}
                {isProcessModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div
                            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsProcessModalOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-100 transition-all z-30"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <ExpenditureProcessFlow campaignType={campaign.type as any} />
                            </div>
                        </div>
                        <div className="absolute inset-0 -z-10" onClick={() => setIsProcessModalOpen(false)}></div>
                    </div>
                )}
            </div>
        </div>
    );
}
