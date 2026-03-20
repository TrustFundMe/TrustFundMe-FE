'use client';

import { useEffect, useState, useMemo, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight, ShieldCheck, User, MoreVertical, X } from 'lucide-react';
import Image from 'next/image';

const planeImg = '/assets/img/campaign/5.png';
const blocksImg = '/assets/img/campaign/6.png';
const infinityImg = '/assets/img/campaign/7.png';
const flowBgImg = '/assets/img/campaign/8.png';

import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { mediaService } from '@/services/mediaService';
import { feedPostService } from '@/services/feedPostService';
import { toast } from 'react-hot-toast';
import { Expenditure } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';
import { FileUp, Send } from 'lucide-react';

export default function CampaignExpendituresPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');
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

    // Expandable Row State
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [selectedLogStep, setSelectedLogStep] = useState<number>(1);

    // Evidence Submission States
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [evidenceDescription, setEvidenceDescription] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        if (!campaignId) {
            setError('Thiếu mã chiến dịch.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch campaign details
                const campaignData = await campaignService.getById(Number(campaignId));
                setCampaign(campaignData);

                // Fetch expenditures
                const expendituresData = await expenditureService.getByCampaignId(Number(campaignId));
                setExpenditures(expendituresData);
            } catch (err) {
                console.error('Không thể tải dữ liệu:', err);
                setError('Không thể tải dữ liệu chiến dịch hoặc khoản chi.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, isAuthenticated, authLoading, router]);

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

        if (campaign.type === 'AUTHORIZED') {
            // Quỹ ủy quyền: có thể tạo mới nếu tất cả exp đều là DISBURSED+bằng chứng hoặc REJECTED
            const hasActiveExp = expenditures.some(e =>
                e.status !== 'DISBURSED' && e.status !== 'REJECTED'
            );
            const hasDisbursedWithoutProof = expenditures.some(e =>
                e.status === 'DISBURSED' && !e.disbursementProofUrl
            );
            if (hasActiveExp) {
                return { canCreate: false, isDisabled: false, blockReason: 'Khoản chi hiện tại chưa hoàn tất. Khoản chi mới chỉ được tạo khi khoản chi hiện tại đã giải ngân và có bằng chứng, hoặc bị từ chối.' };
            }
            if (hasDisbursedWithoutProof) {
                return { canCreate: false, isDisabled: false, blockReason: 'Vui lòng nộp bằng chứng cho khoản chi đã giải ngân trước khi tạo khoản chi mới.' };
            }
        } else if (campaign.type === 'ITEMIZED') {
            // Quỹ vật phẩm: có thể tạo mới nếu tất cả exp đều là DISBURSED+bằng chứng
            const hasActiveExp = expenditures.some(e => e.status !== 'DISBURSED');
            const hasDisbursedWithoutProof = expenditures.some(e =>
                e.status === 'DISBURSED' && !e.disbursementProofUrl
            );
            if (hasActiveExp) {
                return { canCreate: false, isDisabled: false, blockReason: 'Khoản chi hiện tại chưa hoàn tất. Khoản chi mới chỉ được tạo khi khoản chi hiện tại đã được giải ngân và có bằng chứng.' };
            }
            if (hasDisbursedWithoutProof) {
                return { canCreate: false, isDisabled: false, blockReason: 'Vui lòng nộp bằng chứng cho khoản chi đã giải ngân trước khi tạo khoản chi mới.' };
            }
        }

        return { canCreate: true, blockReason: null, isDisabled: false };
    }, [campaign, expenditures]);
    // === END ===

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'APPROVED':
            case 'WITHDRAWAL_REQUESTED':
            case 'CLOSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Đã duyệt</span>;
            case 'DISBURSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Đã giải ngân</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100"><X className="w-3 h-3 mr-1" /> Bị từ chối</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100">{status}</span>;
        }
    };

    const handleRequestWithdrawal = async (id: number) => {
        if (campaign?.type === 'ITEMIZED') {
            setSelectedExpId(id);
            setEvidenceDate('');
            setModalError(null);
            setShowWithdrawalModal(true);
            return;
        }

        if (!confirm('Xác nhận gửi yêu cầu rút tiền cho kế hoạch này?')) return;

        try {
            setLoading(true);
            const updated = await expenditureService.requestWithdrawal(id);
            setExpenditures(prev => prev.map(exp => exp.id === id ? updated : exp));
            toast.success('Yêu cầu rút tiền đã được gửi thành công.');
            setSelectedLogStep(2);
        } catch (err: any) {
            console.error('Withdrawal request failed:', err);
            toast.error(err.response?.data?.message || 'Yêu cầu rút tiền thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
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
                attachments: attachments,
                expenditureId: Number(campaignId)  // store campaign ID so the forum can display the campaign name
            });

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
                                    <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100"><Clock className="w-4 h-4" /></span> QUY TRÌNH GIẢI NGÂN (QUỸ TỰ LẬP)
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
                        <div className="w-full">
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
                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 1 ? 'text-red-900' : 'text-emerald-700'}`}>
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
                                                                                        <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${exp.status === 'REJECTED' ? 'bg-rose-500 ring-4 ring-rose-50' : (exp.isWithdrawalRequested ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-gray-200 ring-4 ring-gray-50')}`}></div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 2 ? 'text-red-900' : (exp.status === 'REJECTED' ? 'text-rose-600' : (exp.isWithdrawalRequested ? 'text-emerald-700' : 'text-black/30'))}`}>
                                                                                                2. {exp.status === 'REJECTED' ? 'Bị từ chối' : (campaign.type === 'AUTHORIZED' && exp.staffReviewId ? 'Đã duyệt' : 'Yêu cầu rút tiền')}
                                                                                            </span>
                                                                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                {exp.status === 'REJECTED' ? 'Đã phản hồi' : (exp.isWithdrawalRequested ? 'Đã thực hiện' : 'Chưa thực hiện')}
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
                                                                                                <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${(exp.disbursedAt || exp.status === 'DISBURSED') ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-gray-200 ring-4 ring-gray-50'}`}></div>
                                                                                                <div className="flex flex-col">
                                                                                                    <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 3 ? 'text-red-900' : ((exp.disbursedAt || exp.status === 'DISBURSED') ? 'text-emerald-700' : 'text-black/30')}`}>
                                                                                                        3. Admin giải ngân
                                                                                                    </span>
                                                                                                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                        { (exp.disbursedAt || exp.status === 'DISBURSED') ? 'Đã chuyển tiền' : 'Đang xử lý'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </button>

                                                                                            {/* Step 4: Upload bằng chứng */}
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); setSelectedLogStep(4); }}
                                                                                                className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 4 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                            >
                                                                                                <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'bg-emerald-500 ring-4 ring-emerald-50' : (exp.status === 'DISBURSED' ? 'bg-amber-400 ring-4 ring-amber-50' : 'bg-gray-200 ring-4 ring-gray-50')}`}></div>
                                                                                                <div className="flex flex-col">
                                                                                                    <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 4 ? 'text-red-900' : ((exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'text-emerald-700' : (exp.status === 'DISBURSED' ? 'text-amber-600' : 'text-black/30'))}`}>
                                                                                                        4. Bằng chứng chi tiêu
                                                                                                    </span>
                                                                                                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                        {exp.evidenceStatus === 'SUBMITTED' ? 'Đã nộp minh chứng' : exp.evidenceStatus === 'APPROVED' ? 'Đã xác nhận' : exp.status === 'DISBURSED' ? 'Chờ nộp minh chứng' : 'Chưa giải ngân'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </button>

                                                                                            {/* Step 5: Hoàn tiền thừa */}
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); setSelectedLogStep(5); }}
                                                                                                className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 5 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                            >
                                                                                                <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${exp.evidenceStatus === 'APPROVED' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-gray-200 ring-4 ring-gray-50'}`}></div>
                                                                                                <div className="flex flex-col">
                                                                                                    <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 5 ? 'text-red-900' : 'text-black/30'}`}>
                                                                                                        5. Hoàn tiền dư
                                                                                                    </span>
                                                                                                    <span className="text-[10px] font-bold text-black/30 uppercase tracking-wide italic">Sắp ra mắt</span>
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
                                                                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Hoàn tất</span>
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
                                                                                                        <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Mã hóa đơn</label>
                                                                                                        <p className="text-xs font-bold text-black">#{exp.id}</p>
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
                                                                                                ) : (campaign.type === 'AUTHORIZED' && exp.staffReviewId) ? (
                                                                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã duyệt</span>
                                                                                                ) : exp.isWithdrawalRequested ? (
                                                                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã gửi</span>
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
                                                                                                                <span>Người xét duyệt: Staff #{exp.staffReviewId || 'Hệ thống'}</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : exp.isWithdrawalRequested ? (
                                                                                                    <div className="space-y-6">
                                                                                                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                                                                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                                                                                                <CheckCircle className="w-6 h-6" />
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <p className="text-sm font-black text-emerald-900">{campaign.type === 'AUTHORIZED' && exp.staffReviewId ? 'Khoản chi đã được xét duyệt' : 'Yêu cầu đã được ghi nhận'}</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        {campaign.type === 'AUTHORIZED' && exp.staffReviewId && (
                                                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-tight ml-2">
                                                                                                                <User className="w-3.5 h-3.5" />
                                                                                                                <span>Nhân viên duyệt: Staff #{exp.staffReviewId}</span>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <p className="text-sm font-bold text-black/60 leading-relaxed italic">
                                                                                                            {campaign.type === 'AUTHORIZED' && exp.staffReviewId
                                                                                                                ? 'Kế hoạch chi tiêu của bạn đã được phê duyệt. Hệ thống đang tiến hành các bước giải ngân.'
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
                                                                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã giải ngân</span>
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
                                                                                                        <div className="absolute top-6 right-6 px-3 py-1.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-xl shadow-lg">Transaction Verified</div>
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
                                                                                                <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">BẰNG CHỨNG CHI TIÊU</h4>
                                                                                                {exp.evidenceStatus === 'SUBMITTED' && (
                                                                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">Đã nộp – chờ xác nhận</span>
                                                                                                )}
                                                                                                {exp.evidenceStatus === 'APPROVED' && (
                                                                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã xác nhận</span>
                                                                                                )}
                                                                                            </div>
                                                                                            {exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED' ? (
                                                                                                <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                                                                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                                                                                        <CheckCircle className="w-6 h-6" />
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <p className="text-sm font-black text-emerald-900">Minh chứng đã được nộp thành công!</p>
                                                                                                        <p className="text-[10px] font-bold text-emerald-700/60 mt-1">Bài viết đã được tự động đăng lên Feed. Đang chờ Admin xác nhận.</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : null}

                                                                                            <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm space-y-8">
                                                                                                <div className="space-y-4">
                                                                                                    <label className="text-[10px] font-black uppercase text-black/30 tracking-[2px] ml-2 block">Hình ảnh minh chứng (Hóa đơn/Vật phẩm)</label>
                                                                                                    
                                                                                                    <div className="relative group/upload">
                                                                                                        <input 
                                                                                                            type="file" 
                                                                                                            multiple
                                                                                                            accept="image/*"
                                                                                                            onChange={(e) => {
                                                                                                                if (e.target.files) {
                                                                                                                    setEvidenceFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                                                                                                }
                                                                                                            }}
                                                                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                                                            disabled={uploadingEvidence}
                                                                                                        />
                                                                                                        <div className={`aspect-video rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 ${evidenceFiles.length > 0 ? 'border-emerald-200 bg-emerald-100/10' : 'border-black/5 bg-gray-50 group-hover/upload:border-red-900/20 group-hover/upload:bg-red-50/10'}`}>
                                                                                                            <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm border border-black/5 flex items-center justify-center mb-4 transition-transform group-hover/upload:scale-110">
                                                                                                                <FileUp className="w-8 h-8 text-black/20" />
                                                                                                            </div>
                                                                                                            <p className="text-xs font-black text-black/60">Kéo thả hoặc nhấn để chọn thêm ảnh</p>
                                                                                                            <p className="text-[9px] font-black text-black/20 uppercase mt-2 tracking-widest">JPG, PNG, WEBP (Tối đa 10MB mỗi ảnh)</p>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {evidenceFiles.length > 0 && (
                                                                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                                                                                            {evidenceFiles.map((file, idx) => (
                                                                                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-black/5 group/img shadow-sm animate-in zoom-in-50 duration-300">
                                                                                                                    <img 
                                                                                                                        src={URL.createObjectURL(file)} 
                                                                                                                        alt={`Preview ${idx}`} 
                                                                                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                                                                                                    />
                                                                                                                    <button 
                                                                                                                        onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== idx))}
                                                                                                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black"
                                                                                                                    >
                                                                                                                        <X className="w-4 h-4" />
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>

                                                                                                <div className="space-y-4">
                                                                                                    <label className="text-[10px] font-black uppercase text-black/30 tracking-[2px] ml-2 block">Mô tả hoặc Lời cảm ơn</label>
                                                                                                    <textarea 
                                                                                                        placeholder="Chia sẻ về việc mua sắm này hoặc gửi lời cảm ơn tới những người đã ủng hộ..."
                                                                                                        value={evidenceDescription}
                                                                                                        onChange={(e) => setEvidenceDescription(e.target.value)}
                                                                                                        className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2rem] text-sm font-bold text-black focus:ring-2 focus:ring-black/5 outline-none min-h-[140px] resize-none transition-all placeholder:text-black/20"
                                                                                                        disabled={uploadingEvidence}
                                                                                                    />
                                                                                                </div>

                                                                                                <div className="pt-4">
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                            if (isDisabled) {
                                                                                toast.error('Chiến dịch đã bị vô hiệu hóa, không thể gửi minh chứng.');
                                                                                return;
                                                                            }
                                                                            handleEvidenceSubmit(exp.id);
                                                                        }}
                                                                                                        disabled={evidenceFiles.length === 0 || uploadingEvidence || isDisabled}
                                                                                                        className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${evidenceFiles.length === 0 || uploadingEvidence 
                                                                                                            ? 'bg-gray-100 text-black/20 cursor-not-allowed shadow-none' 
                                                                                                            : 'bg-black text-white hover:bg-emerald-900 shadow-emerald-900/10 active:scale-[0.98]'}`}
                                                                                                    >
                                                                                                        {uploadingEvidence ? (
                                                                                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                                                                        ) : (
                                                                                                            <>
                                                                                                                <Send className="w-4 h-4" />
                                                                                                                <span className="text-[11px] font-black uppercase tracking-[2px]">Gửi báo cáo & Đăng post</span>
                                                                                                            </>
                                                                                                        )}
                                                                                                    </button>
                                                                                                    <p className="text-center mt-6 text-[9px] font-bold text-black/20 uppercase tracking-[2px] leading-relaxed">
                                                                                                        Hệ thống sẽ tự động tạo một bài viết cập nhật trên Feed <br/> kèm theo hình ảnh minh chứng của bạn.
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {selectedLogStep === 5 && (
                                                                                        <div className="space-y-8">
                                                                                            <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">HOÀN TIỀN DƯ</h4>
                                                                                            <div className="bg-gray-50 p-12 rounded-[2.5rem] border-2 border-dashed border-black/5 flex flex-col items-center text-center space-y-6">
                                                                                                <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-sm">
                                                                                                    <ArrowLeft className="w-10 h-10 text-black/10" />
                                                                                                </div>
                                                                                                <div className="max-w-[280px]">
                                                                                                    <p className="text-[10px] font-black text-black/30 uppercase tracking-[2px] mb-2">Sắp ra mắt</p>
                                                                                                    <p className="text-sm font-bold text-black/40 leading-relaxed">
                                                                                                        Số tiền thừa so với thực tế chi tiêu sẽ được hoàn trả lại vào Quỹ chung để tiếp tục hỗ trợ.
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="mt-auto pt-10 border-t border-black/5 flex gap-4">
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); router.push(`/account/campaigns/expenditures/${exp.id}?campaignId=${campaign.id}`); }}
                                                                                        className="flex-1 p-6 rounded-[2rem] bg-black text-white hover:bg-red-900 transition-all duration-500 shadow-2xl shadow-black/10 flex items-center justify-between group"
                                                                                    >
                                                                                        <span className="text-[10px] font-black uppercase tracking-[2.5px]">Xem danh sách vật phẩm</span>
                                                                                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                                                                            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:scale-110" />
                                                                                        </div>
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
                {
                    showWithdrawalModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                                <div className="p-10">
                                    <h3 className="text-2xl font-black text-black tracking-tighter mb-2">Yêu cầu giải ngân</h3>
                                    <p className="text-xs font-bold text-black/40 mb-8 bg-red-50/50 p-4 rounded-2xl border border-red-100/50 leading-relaxed italic">
                                        <strong>Lưu ý quan trọng:</strong> Yêu cầu này sẽ chốt đợt quyên góp hiện tại để tiến hành giải ngân. Vui lòng xác định hạn nộp minh chứng chi tiêu.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="evidenceDate" className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-2">
                                                Hạn nộp minh chứng chi tiêu
                                            </label>
                                            <input
                                                type="datetime-local"
                                                id="evidenceDate"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white outline-none transition-all"
                                                value={evidenceDate}
                                                onChange={(e) => setEvidenceDate(e.target.value)}
                                            />
                                            <p className="mt-1 text-[9px] font-bold text-black/20 uppercase tracking-widest ml-2 italic">Ràng buộc: Không quá 1 tháng kể từ hôm nay.</p>
                                        </div>

                                        {modalError && (
                                            <div className="p-4 bg-red-50 text-[#dc2626] text-[10px] font-black uppercase tracking-tight rounded-2xl flex items-center gap-3 animate-shake">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                {modalError}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <button
                                            onClick={() => setShowWithdrawalModal(false)}
                                            className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
                                            disabled={submittingWithdrawal}
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            onClick={submitWithdrawal}
                                            className="flex-[2] px-4 py-3 bg-[#dc2626] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            disabled={submittingWithdrawal}
                                        >
                                            {submittingWithdrawal ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>Xác nhận yêu cầu</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

