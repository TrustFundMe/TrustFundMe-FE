'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, AlertCircle, X } from 'lucide-react';
import CreateOrEditPostModal from '@/components/feed-post/CreateOrEditPostModal';

import ExpenditureStats from './components/ExpenditureStats';
import ExpenditureProcessFlow from './components/ExpenditureProcessFlow';
import ExpenditureTable from './components/ExpenditureTable';
import AccountCampaignTabbar from './components/AccountCampaignTabbar';
import UpdateExpenditureModal from './components/UpdateExpenditureModal';
import RefundExpenditureModal from './components/RefundExpenditureModal';
import WithdrawalModal from '@/components/campaign/WithdrawalModal';

import { useAuth } from '@/contexts/AuthContextProxy';
import { useExpenditureLogic } from './hooks/useExpenditureLogic';

export default function CampaignExpendituresPage() {
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
        totalSpent, canCreate, blockReason, isDisabled, setGalleryModalItemId
    } = useExpenditureLogic(campaignId, user, isAuthenticated, authLoading);

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
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/account/campaigns" className="inline-flex items-center text-black/40 hover:text-black mb-6 transition-colors text-[10px] font-black uppercase tracking-[2px]">
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
                            <h1 className="text-4xl font-black text-black tracking-tighter leading-none mt-4">{campaign.title}</h1>
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

                {/* Stats */}
                <ExpenditureStats 
                    balance={campaign.balance} 
                    expendituresCount={expenditures.length} 
                    totalSpent={totalSpent} 
                />

                {/* Process Flow */}
                <ExpenditureProcessFlow campaignType={campaign.type as any} />

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
                    />
                )}

                {isPostModalOpen && postExpenditure && campaign && (
                    <CreateOrEditPostModal
                        isOpen={isPostModalOpen}
                        onClose={() => { setIsPostModalOpen(false); setPostExpenditure(null); setCurrentDraftPost(null); }}
                        campaignsList={[{ id: campaign.id, title: campaign.title }]}
                        campaignTitlesMap={{ [campaign.id]: campaign.title }}
                        initialData={currentDraftPost ? {
                            ...currentDraftPost,
                            attachments: (currentDraftPost.attachments && currentDraftPost.attachments.length > 0)
                                ? currentDraftPost.attachments
                                : (postExpenditure?.items || []).flatMap(item => itemMedia[item.id] || []).map(m => ({ url: m.url, id: m.id, type: 'image' })),
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
                            targetName: 'evidence',
                            attachments: (postExpenditure?.items || []).flatMap(item => itemMedia[item.id] || []).map(m => ({ url: m.url, id: m.id, type: 'image' })),
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
            </div>
        </div>
    );
}
