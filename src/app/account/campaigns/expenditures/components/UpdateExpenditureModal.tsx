import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Receipt, AlertCircle, Image as ImageIcon, ExternalLink, ChevronRight, Check, PenTool, Link as LinkIcon, PenSquare, Loader2 } from 'lucide-react';
import { CampaignDto } from '@/types/campaign';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { MediaUploadResponse } from '@/services/mediaService';
import { feedPostService } from '@/services/feedPostService';
import { toast } from 'react-hot-toast';
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

interface UpdateExpenditureModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: CampaignDto;
    updateExpenditure: Expenditure;
    updateItemsData: ExpenditureItem[];
    updateItems: { id: number; actualQuantity: number; actualPrice: number; actualPurchaseLink?: string; actualBrand?: string }[];
    itemMedia: Record<number, MediaUploadResponse[]>;
    donationSummary: Record<number, number>;
    isRefundDone: boolean;
    handleUpdateItemChange: (index: number, field: 'actualQuantity' | 'actualPrice' | 'actualPurchaseLink' | 'actualBrand', value: string) => void;
    handleUpdateSubmit: () => void;
    updating: boolean;
    setGalleryModalItemId: (id: number) => void;
    setIsPostModalOpen?: (open: boolean) => void;
    setPostExpenditure?: (exp: Expenditure | null) => void;
    setCurrentDraftPost?: (post: any) => void;
    fetchData?: (isSilent?: boolean) => Promise<void>;
    expenditures: Expenditure[];
}

import { expenditureService } from '@/services/expenditureService';

export default function UpdateExpenditureModal({
    isOpen,
    onClose,
    campaign,
    updateExpenditure,
    updateItemsData,
    updateItems,
    itemMedia,
    donationSummary,
    isRefundDone,
    handleUpdateItemChange,
    handleUpdateSubmit,
    updating,
    setGalleryModalItemId,
    setIsPostModalOpen,
    setPostExpenditure,
    setCurrentDraftPost,
    fetchData,
    expenditures
}: UpdateExpenditureModalProps) {
    const router = useRouter();
    // Determine initial step based on expenditure status or passed evidence
    const defaultStep = (updateExpenditure as any).selectedEvidenceId ? 3 : 1;
    const [currentStep, setCurrentStep] = useState(defaultStep);

    if (!isOpen || !updateExpenditure) return null;

    const isItemized = campaign.type === 'ITEMIZED';

    const renderPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.abs(n)) + ' VND';
    const renderNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    // Calculate Totals
    let totalPlanAmt = 0;
    let totalActualAmt = 0;

    const [postTitle, setPostTitle] = useState(`Cập nhật minh chứng chi tiêu: ${campaign.title}`);
    const [postContent, setPostContent] = useState(`Tôi vừa hoàn thành chi tiêu cho chiến dịch "${campaign.title}". Mời mọi người cùng theo dõi!`);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // New states for Step 3 list
    const [evidenceProofUrls, setEvidenceProofUrls] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        updateExpenditure.evidences?.forEach(ev => {
            if (ev.proofUrl) initial[ev.id] = ev.proofUrl;
        });
        return initial;
    });
    const [submittingEvidence, setSubmittingEvidence] = useState<number | null>(null);

    const handleEvidenceSubmit = async (evidenceId: number) => {
        const proofUrl = evidenceProofUrls[evidenceId];
        if (!proofUrl) return;
        
        try {
            setSubmittingEvidence(evidenceId);
            await expenditureService.submitEvidence(evidenceId, proofUrl);
            toast.success('Đã lưu minh chứng thành công!');
            if (fetchData) fetchData(true);
        } catch (err: any) {
            toast.error('Có lỗi khi lưu minh chứng: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingEvidence(null);
        }
    };

    // Form steps configuration
    const steps = [
        { id: 1, title: 'Tổng quan', icon: Receipt },
        { id: 2, title: 'Quản lý ảnh', icon: ImageIcon },
        { id: 3, title: 'Minh chứng', icon: PenTool },
    ];

    const onNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const onBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleStepSubmit = async () => {
        if (currentStep === 3) {
            // Step 3 finished -> Go to standalone page for Step 4
            onClose();
            router.push(`/account/campaigns/expenditures/update/${updateExpenditure.id}?campaignId=${campaign.id}`);
        } else {
            onNext();
        }
    };
    const StepProgress = () => (
        <div className="flex items-center justify-center gap-1 sm:gap-4 px-4 py-3 bg-white border-b border-gray-100 shrink-0">
            {steps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = currentStep === s.id;
                const isPast = currentStep > s.id;
                return (
                    <Fragment key={s.id}>
                        <div className="flex flex-col items-center gap-1 group relative">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 scale-110' : isPast ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                                {isPast ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{s.title}</span>
                            {isActive && <div className="absolute -bottom-3 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-[2px] max-w-[40px] sm:max-w-[60px] rounded-full transition-colors duration-500 ${isPast ? 'bg-emerald-500' : 'bg-gray-100'}`} />
                        )}
                    </Fragment>
                );
            })}
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6 py-4 px-2">
            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl">
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Tổng quan đợt chi tiêu
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Dự kiến chi</span>
                        <span className="text-xl font-black text-gray-900 tracking-tight">{renderPrice(updateExpenditure.totalExpectedAmount || 0)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Đã giải ngân</span>
                        <span className="text-xl font-black text-emerald-600 tracking-tight">{renderPrice(updateExpenditure.totalReceivedAmount || 0)}</span>
                    </div>
                </div>
                <div className="mt-4 text-xs font-medium text-emerald-800 leading-relaxed bg-white/50 p-4 rounded-xl border border-emerald-100/50">
                    Chào bạn! Quy trình cập nhật chi tiêu gồm 4 bước: 
                    <br/>- <b>Bước 1</b>: Xem lại tổng số tiền.
                    <br/>- <b>Bước 2</b>: Tải lên hình ảnh hóa đơn, vật phẩm cho từng hạng mục.
                    <br/>- <b>Bước 3</b>: Nộp minh chứng cho các khoản đã giải ngân (đăng bài viết).
                    <br/>- <b>Bước 4</b>: Cập nhật số liệu thực tế cuối cùng và tổng kết.
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4 py-2">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl mb-4">
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider text-center">
                    Vui lòng tải ảnh minh chứng (hóa đơn, vật phẩm) cho từng hạng mục dưới đây
                </p>
            </div>
            {updateItemsData.map((item, index) => {
                const modalMedia = itemMedia[item.id] || [];
                return (
                    <div key={item.id} className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all">
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-gray-900 uppercase truncate">{item.name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 italic">Hạng mục: {item.catologyName || 'N/A'}</p>
                        </div>
                        <button
                            onClick={() => setGalleryModalItemId(item.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {modalMedia.length > 0 ? `${modalMedia.length} Ảnh` : 'Thêm Ảnh'}
                            </span>
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderStep3 = () => {
        const evidences = updateExpenditure.evidences || [];

        return (
            <div className="space-y-6 py-2">
                <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                            <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-950 uppercase tracking-widest">Danh sách Minh chứng Giao dịch</h4>
                            <p className="text-[10px] font-bold text-amber-700/60 uppercase">Cần nộp minh chứng bài đăng cho từng giao dịch đã giải ngân</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {evidences.length > 0 ? (
                            evidences.map((evidence, idx) => (
                                <div key={evidence.id} className="bg-white p-3 rounded-3xl border border-amber-100 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">#{idx + 1}</div>
                                            <div>
                                                <p className="text-sm font-black text-black">Số tiền: -{renderPrice(evidence.amount)}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ngày: {evidence.createdAt ? new Date(evidence.createdAt).toLocaleDateString('vi-VN') : '---'}</p>
                                                {evidence.dueAt && (
                                                    <p className="text-xs font-black text-rose-500 uppercase tracking-tighter">Hạn nộp: {new Date(evidence.dueAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                                )}
                                            </div>
                                        </div>
                                        {evidence.proofUrl ? (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã nộp</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-rose-100 animate-pulse">Chưa nộp</span>
                                        )}
                                    </div>

                                    {evidence.description && (
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                            <p className="text-[10px] text-slate-500 italic leading-relaxed">"{evidence.description}"</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="url"
                                                placeholder="Dán link bài viết minh chứng..."
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                                                value={evidenceProofUrls[evidence.id] || ''}
                                                onChange={(e) => setEvidenceProofUrls(prev => ({ ...prev, [evidence.id]: e.target.value }))}
                                            />
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => {
                                                    if (evidence.proofUrl) {
                                                        window.open(evidence.proofUrl, '_blank');
                                                    } else if (setPostExpenditure && setIsPostModalOpen && setCurrentDraftPost) {
                                                        setPostExpenditure(updateExpenditure);
                                                        setCurrentDraftPost({
                                                            title: `Minh chứng chi tiêu: ${renderPrice(evidence.amount)}`,
                                                            content: `Tôi vừa hoàn thành thực hiện chi tiêu cho chiến dịch "${campaign.title}".\nSố tiền: ${renderPrice(evidence.amount)}\nNgày thực hiện: ${evidence.createdAt ? new Date(evidence.createdAt).toLocaleDateString('vi-VN') : '---'}\n\n#MinhChungChiTieu #TrustFundMe`,
                                                            targetId: updateExpenditure.id,
                                                            targetType: 'EXPENDITURE',
                                                            targetName: 'Minh chứng giải ngân',
                                                            _evidenceId: evidence.id,
                                                            visibility: 'PUBLIC',
                                                            status: 'PUBLISHED'
                                                        });
                                                        setIsPostModalOpen(true);
                                                    }
                                                }}
                                                className={`flex items-center gap-2 px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${evidence.proofUrl ? 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'}`}
                                            >
                                                {evidence.proofUrl ? <LinkIcon className="w-4 h-4" /> : <PenSquare className="w-4 h-4" />}
                                                {evidence.proofUrl ? 'Xem minh chứng' : 'Đăng bài minh chứng'}
                                            </button>
                                            <button
                                                onClick={() => handleEvidenceSubmit(evidence.id)}
                                                disabled={submittingEvidence === evidence.id || !evidenceProofUrls[evidence.id]}
                                                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 disabled:opacity-30 transition-all shadow-xl shadow-black/10 whitespace-nowrap"
                                            >
                                                {submittingEvidence === evidence.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Lưu URL
                                            </button>
                                        </div>
                                    </div>
                                    {evidence.proofUrl && (
                                        <a href={evidence.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:underline px-1">
                                            <ExternalLink className="w-3 h-3" /> Xem bài viết đã nộp
                                        </a>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <AlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Không có dữ liệu minh chứng</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderStep4 = () => null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto font-sans" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-12 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>
                <div className="inline-block bg-[#f8fafc] rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all align-middle sm:max-w-6xl w-full flex flex-col border border-white/40 ring-1 ring-gray-900/5 max-h-[95vh] relative z-20">
                    
                    {/* Header */}
                    <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 shadow-sm relative z-30">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Receipt className="w-7 h-7 text-white" />
                            </div>
                            <div className="leading-tight">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight" id="modal-title">
                                    Cập nhật Thực Tế & Minh Chứng 
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-md tracking-widest border border-emerald-200">Bước {currentStep}/3</span>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{campaign.title}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all bg-gray-50 border border-gray-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <StepProgress />

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-slate-50/50">
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                    </div>

                    {/* Footer Nav */}
                    <div className="bg-white border-t border-gray-100 p-6 shrink-0 relative z-30 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.06)] flex items-center justify-between">
                        <button
                            onClick={onBack}
                            disabled={currentStep === 1 || isSubmitting}
                            className={`flex items-center gap-2 px-8 py-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${currentStep === 1 || isSubmitting ? 'bg-gray-50 border-gray-100 text-gray-300 opacity-50 cursor-not-allowed' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" /> Quay lại
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleStepSubmit}
                                disabled={updating || isSubmitting}
                                className={`flex items-center gap-2 px-12 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 ${updating || isSubmitting ? 'bg-gray-200 text-gray-400 shadow-none' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                            >
                                {isSubmitting ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang Xử Lý...</>
                                ) : currentStep === 4 ? (
                                    <><Check className="w-4 h-4" /> Hoàn tất</>
                                ) : (
                                    <>Tiếp theo <ChevronRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
