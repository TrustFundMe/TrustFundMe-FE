import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    FileText, Plus, CheckCircle, X, AlertCircle, ArrowUpRight,
    Clock, ShieldCheck, DollarSign, Receipt, Image as ImageIcon, User, Send, Camera, Edit3, MessageSquare
} from 'lucide-react';
import { feedPostService } from '@/services/feedPostService';
import { expenditureService } from '@/services/expenditureService';
import EvidenceDeadlineBanner from '@/components/campaign/EvidenceDeadlineBanner';

export default function ExpenditureTable({
    expenditures,
    campaign,
    isDisabled,
    staffNameMap,
    staffIdMap,
    expenditurePosts,
    handleRequestWithdrawal,
    handleChatWithStaff,
    setCurrentDraftPost,
    setPostExpenditure,
    setIsPostModalOpen,
    setRefundExpenditure,
    setRefundAmount,
    setShowRefundModal,
    handleOpenUpdateModal,
    fetchData
}: any) {
    const router = useRouter();
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [selectedLogStep, setSelectedLogStep] = useState<number>(1);
    const [uploadingEvidence, setUploadingEvidence] = useState(false);

    const getStatusBadge = (status: string) => {
        const getStatusText = (s: string) => {
            switch (s) {
                case 'PENDING': return 'Đang chờ xử lý';
                case 'APPROVED': return 'Đã được duyệt';
                case 'PENDING_REVIEW': return 'Chờ Quản trị viên duyệt';
                case 'DISBURSED': return 'Đã giải ngân';
                case 'REJECTED': return 'Bị từ chối';
                case 'ALLOWED_EDIT': return 'Yêu cầu sửa';
                case 'CLOSED': return 'Đã hoàn tất';
                default: return s;
            }
        };
        return <span className="text-[10px] font-black uppercase tracking-widest text-black">{getStatusText(status)}</span>;
    };

    const handleOpenPostForEvidence = (exp: any, ev: any) => {
        if (isDisabled) {
            toast.error('Chiến dịch đã bị vô hiệu hóa.');
            return;
        }
        setPostExpenditure(exp);
        setCurrentDraftPost({
            title: `Minh chứng chi tiêu: ${new Intl.NumberFormat('vi-VN').format(ev.amount)} VND`,
            content: `Minh chứng thực hiện chi tiêu cho chiến dịch "${campaign.title}".\nSố tiền: ${new Intl.NumberFormat('vi-VN').format(ev.amount)} VND\n\n#MinhChungChiTieu #TrustFundMe`,
            targetId: exp.id,
            targetType: 'EXPENDITURE',
            targetName: `evidence|${ev.id}`,
            _evidenceId: ev.id,
            visibility: 'PUBLIC',
            status: 'PUBLISHED'
        });
        setIsPostModalOpen(true);
    };

    return (
        <div className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] rounded-[3rem] border border-black/5 overflow-hidden">
            <div className="px-10 py-3 border-b border-black/5 bg-white flex justify-between items-center">
                <h2 className="text-[10px] font-black text-black uppercase tracking-[3px]">Danh sách các đợt chi tiêu</h2>
            </div>

            {expenditures.length === 0 ? (
                <div className="text-center py-20 px-6">
                    <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-[2rem] bg-gray-50 text-black/10 mb-6">
                        <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-black text-black tracking-tight">Chưa có đợt chi tiêu nào</h3>
                    <p className="mt-2 text-sm font-bold text-black/30">Bắt đầu bằng cách tạo một đợt chi tiêu mới cho chiến dịch này.</p>
                    <div className="mt-10">
                        <Link
                            href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                            className="inline-flex items-center px-8 py-3 rounded-full shadow-xl shadow-red-900/5 text-[10px] font-black uppercase tracking-widest text-white bg-red-800 hover:bg-red-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                            Tạo đợt chi tiêu đầu tiên
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="w-full max-h-[500px] overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 border-b border-black/5">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-black uppercase tracking-[2px]">
                                    STT
                                </th>
                                <th scope="col" className="px-10 py-3 text-left text-[10px] font-black text-black uppercase tracking-[2px]">
                                    Mô tả / Kế hoạch
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-black uppercase tracking-[2px]">
                                    Trạng thái
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-black uppercase tracking-[2px]">
                                    Ngày tạo
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-black uppercase tracking-[2px]">
                                    Hành động
                                </th>
                                <th scope="col" className="relative px-10 py-3">
                                    <span className="sr-only">Expand</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {expenditures.map((exp: any) => {
                                const isExpanded = expandedRowId === exp.id;
                                const evidences = exp.evidences || [];
                                const submittedCount = evidences.filter((ev: any) => ev.proofUrl).length;
                                const totalCount = evidences.length;
                                const pendingEvidences = evidences.filter((ev: any) => !ev.proofUrl);
                                const nextPendingEv = pendingEvidences[0];

                                const earliestDeadline = pendingEvidences
                                    .map((ev: any) => ev.dueAt)
                                    .filter(Boolean)
                                    .sort()[0];

                                return (
                                    <Fragment key={exp.id}>
                                        <tr
                                            onClick={() => {
                                                const isNowExpanded = !isExpanded;
                                                setExpandedRowId(isNowExpanded ? exp.id : null);
                                                if (isNowExpanded) {
                                                    if (exp.disbursedAt || exp.status === 'DISBURSED') setSelectedLogStep(3);
                                                    else if (exp.isWithdrawalRequested) setSelectedLogStep(2);
                                                    else setSelectedLogStep(1);
                                                }
                                            }}
                                            className={`cursor-pointer transition-[background-color] duration-300 group ${isExpanded ? 'bg-slate-100/50' : 'hover:bg-slate-50 even:bg-slate-50/30'
                                                }`}
                                        >
                                            <td className="px-6 py-2 text-center">
                                                <span className="text-xs font-black text-black/20">{expenditures.indexOf(exp) + 1}</span>
                                            </td>
                                            <td className="px-10 py-2">
                                                <div className={`text-sm font-black transition-colors ${isExpanded ? 'text-black' : 'text-black/80 group-hover:text-black'}`}>
                                                    {exp.plan || 'Đợt chi tiêu không tên'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-black font-black">
                                                {getStatusBadge(exp.status)}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-xs font-black text-black">
                                                {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-3">
                                                    {pendingEvidences.length > 0 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (expandedRowId !== exp.id) {
                                                                    setExpandedRowId(exp.id);
                                                                    setSelectedLogStep(3);
                                                                } else {
                                                                    setSelectedLogStep(3);
                                                                }
                                                            }}
                                                            className="px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center gap-1.5 whitespace-nowrap animate-pulse"
                                                        >
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            Bạn cần nộp {pendingEvidences.length} bài minh chứng
                                                        </button>
                                                    )}

                                                    {!exp.isWithdrawalRequested && (
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
                                                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-black/80'}`}
                                                                >
                                                                    Rút tiền
                                                                </button>
                                                            ) : campaign.type === 'AUTHORIZED' ? (
                                                                exp.status === 'REJECTED' ? (
                                                                    <span className="text-[10px] font-black uppercase text-black flex items-center gap-1">
                                                                        <X className="w-3.5 h-3.5" /> Kết thúc
                                                                    </span>
                                                                ) : exp.status === 'ALLOWED_EDIT' ? (
                                                                    <Link
                                                                        href={`/account/campaigns/expenditures/edit/${exp.id}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="px-4 py-1.5 bg-[#ff5e14] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#e05313] transition-all shadow-lg shadow-orange-100 flex items-center gap-1.5 whitespace-nowrap"
                                                                    >
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                        Chỉnh sửa
                                                                    </Link>
                                                                ) : (
                                                                    <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${isDisabled ? 'text-gray-400' : 'text-black'}`}>
                                                                        <AlertCircle className="w-3.5 h-3.5" /> Chờ báo cáo
                                                                    </span>
                                                                )
                                                            ) : null}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-3 text-right">
                                                <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ArrowUpRight className={`w-5 h-5 transition-[color,opacity] ${isExpanded ? 'text-red-900' : 'text-black/10 group-hover:text-red-900 opacity-60 group-hover:opacity-100'}`} />
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td colSpan={6} className="p-0 border-none relative overflow-hidden">
                                                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        {isExpanded && (
                                                            <div className="px-6 py-6 bg-gray-50/30 border-t border-black/5">
                                                                <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
                                                                    <div>
                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40 mb-4 flex items-center gap-2">
                                                                            NHẬT KÝ QUY TRÌNH
                                                                        </h4>
                                                                        <div className="relative pl-8 space-y-3">
                                                                            <div className="absolute left-[3.5px] top-2 bottom-6 w-[2px] bg-gray-100"></div>

                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setSelectedLogStep(1); }}
                                                                                className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 1 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                            >
                                                                                <div className={`absolute -left-[32px] top-5 w-2.5 h-2.5 rounded-full z-10 bg-emerald-500 ring-4 ring-emerald-50`}></div>
                                                                                <div className="flex flex-col">
                                                                                    <span className={`text-sm font-black block leading-none mb-1 ${selectedLogStep === 1 ? 'text-emerald-900' : 'text-emerald-700'}`}>
                                                                                        1. Khởi tạo đợt chi tiêu
                                                                                    </span>
                                                                                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                        Đã khởi tạo
                                                                                    </span>
                                                                                </div>
                                                                            </button>

                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setSelectedLogStep(2); }}
                                                                                className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 2 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                            >
                                                                                <div className={`absolute -left-[32px] top-5 w-2.5 h-2.5 rounded-full z-10 ${exp.status === 'REJECTED' ? 'bg-rose-500 ring-4 ring-rose-50' : ((exp.status === 'APPROVED' || exp.status === 'DISBURSED' || exp.status === 'CLOSED' || exp.isWithdrawalRequested) ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50')}`}></div>
                                                                                <div className="flex flex-col">
                                                                                    <span className={`text-sm font-black block leading-none mb-1 ${selectedLogStep === 2 ? 'text-emerald-900' : (exp.status === 'REJECTED' ? 'text-rose-600' : (exp.status === 'PENDING_REVIEW' && campaign.type === 'AUTHORIZED' ? 'text-amber-500' : (exp.isWithdrawalRequested || (campaign.type === 'AUTHORIZED' && exp.status !== 'PENDING_REVIEW') ? 'text-emerald-700' : 'text-orange-400')))}`}>
                                                                                        2. {exp.status === 'REJECTED' ? 'Bị từ chối' : (exp.status === 'APPROVED' || exp.status === 'DISBURSED' || exp.status === 'CLOSED') ? 'Đã duyệt' : (campaign.type === 'AUTHORIZED' && exp.status === 'PENDING_REVIEW') ? 'Đang xét duyệt' : 'Yêu cầu rút tiền'}
                                                                                    </span>
                                                                                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                        {(exp.status === 'APPROVED' || exp.status === 'DISBURSED' || exp.status === 'CLOSED') ? 'Đã duyệt' : exp.isWithdrawalRequested ? 'Đã thực hiện yêu cầu rút tiền' : 'Chưa thực hiện'}
                                                                                    </span>
                                                                                </div>
                                                                            </button>

                                                                            {exp.status !== 'REJECTED' && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setSelectedLogStep(3); }}
                                                                                        className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 3 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                    >
                                                                                        <div className={`absolute -left-[32px] top-5 w-2.5 h-2.5 rounded-full z-10 ${(exp.disbursedAt || exp.status === 'DISBURSED' || (totalCount > 0 && submittedCount === totalCount)) ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50'}`}></div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 3 ? 'text-emerald-900' : ((exp.disbursedAt || exp.status === 'DISBURSED' || (totalCount > 0 && submittedCount === totalCount)) ? 'text-emerald-700' : 'text-orange-400')}`}>
                                                                                                3. Minh chứng giao dịch
                                                                                            </span>
                                                                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                {(exp.disbursedAt || exp.status === 'DISBURSED') ? 'Đã chuyển tiền' : (totalCount > 0 && submittedCount === totalCount) ? 'Đã up minh chứng' : 'Đang xử lý'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </button>

                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setSelectedLogStep(4); }}
                                                                                        className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 4 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                                                    >
                                                                                        <div className={`absolute -left-[32px] top-5 w-2.5 h-2.5 rounded-full z-10 ${(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50'}`}></div>
                                                                                        <div className="flex flex-col">
                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 4 ? 'text-emerald-900' : ((exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'text-emerald-700' : 'text-orange-400')}`}>
                                                                                                4. Tổng kết & Thực chi
                                                                                            </span>
                                                                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">
                                                                                                {exp.evidenceStatus === 'SUBMITTED' ? 'Đã nộp minh chứng' : exp.evidenceStatus === 'APPROVED' ? 'Đã xác nhận' : exp.evidenceStatus === 'ALLOWED_EDIT' ? 'Cho chỉnh sửa lại' : exp.status === 'DISBURSED' ? 'Cập nhật & Hoàn tiền' : 'Chưa giải ngân'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col lg:pl-8 lg:border-l border-black/5 min-h-[350px]">
                                                                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                                                            {selectedLogStep === 1 && (
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">CHI TIẾT KHỞI TẠO</h4>
                                                                                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Hoàn tất</span>
                                                                                    </div>
                                                                                    <div className="bg-white p-4 rounded-[1.5rem] border border-black/5 shadow-sm space-y-3">
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
                                                                                                <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Staff đảm nhận</label>
                                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                                    <p className="text-xs font-bold text-black">{staffNameMap[exp.id] || 'Chưa phân công'}</p>
                                                                                                    {staffIdMap[exp.id] && (
                                                                                                        <button
                                                                                                            onClick={() => handleChatWithStaff(exp.id, staffIdMap[exp.id], staffNameMap[exp.id])}
                                                                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-black transition-all border border-blue-100"
                                                                                                        >
                                                                                                            Chat với nhân viên phụ trách
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {selectedLogStep === 2 && (
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">{exp.status === 'REJECTED' ? 'KẾT QUẢ PHẢN HỒI' : ((exp.status === 'APPROVED' || exp.status === 'DISBURSED' || exp.status === 'CLOSED') ? 'KẾT QUẢ XÉT DUYỆT' : (campaign.type === 'AUTHORIZED' && exp.staffReviewId ? 'XÉT DUYỆT CHI TIÊU' : 'YÊU CẦU RÚT TIỀN'))}</h4>
                                                                                        {exp.status === 'REJECTED' ? (
                                                                                            <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-rose-100">Từ chối</span>
                                                                                        ) : (campaign.type === 'AUTHORIZED' && exp.status !== 'PENDING_REVIEW') ? (
                                                                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã duyệt</span>
                                                                                        ) : (campaign.type === 'AUTHORIZED' && exp.status === 'PENDING_REVIEW') ? (
                                                                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">Chờ duyệt</span>
                                                                                        ) : exp.isWithdrawalRequested ? (
                                                                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã gửi</span>
                                                                                        ) : (
                                                                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">Chờ thực hiện</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="bg-white p-4 rounded-[1.5rem] border border-black/5 shadow-sm">
                                                                                        {exp.status === 'REJECTED' ? (
                                                                                            <div className="space-y-4">
                                                                                                <div className="flex items-center gap-4 p-3 bg-rose-50 rounded-2xl border border-rose-100">
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
                                                                                                        <span>Người xét duyệt: {staffNameMap[exp.id] || (exp.staffReviewId ? `Staff #${exp.staffReviewId}` : 'Hệ thống')}</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : exp.status === 'ALLOWED_EDIT' ? (
                                                                                            <div className="space-y-4">
                                                                                                <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                                                                                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                                                                                                        <MessageSquare className="w-6 h-6" />
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <p className="text-sm font-black text-amber-900">Yêu cầu chỉnh sửa</p>
                                                                                                        <p className="text-[10px] font-bold text-amber-700/60 uppercase">Phản hồi vào {exp.updatedAt ? new Date(exp.updatedAt).toLocaleString('vi-VN') : '—'}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="space-y-4">
                                                                                                    <div>
                                                                                                        <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Nội dung cần chỉnh sửa</label>
                                                                                                        <p className="text-sm font-bold text-orange-700 bg-orange-50/50 p-4 rounded-xl border border-orange-100">{exp.rejectReason || 'Không có lý do cụ thể.'}</p>
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-tight">
                                                                                                        <User className="w-3.5 h-3.5" />
                                                                                                        <span>Người xét duyệt: {staffNameMap[exp.id] || (exp.staffReviewId ? `Staff #${exp.staffReviewId}` : 'Hệ thống')}</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : (exp.isWithdrawalRequested || (campaign.type === 'AUTHORIZED' && exp.staffReviewId)) ? (
                                                                                            <div className="space-y-4">
                                                                                                {campaign.type === 'AUTHORIZED' && (<div className={`flex items-center gap-4 p-3 rounded-2xl border ${exp.status === 'PENDING_REVIEW' ? 'bg-amber-50 border-amber-100' : 'bg-orange-50 border-emerald-100'}`}>
                                                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${exp.status === 'PENDING_REVIEW' ? 'bg-amber-400' : 'bg-orange-400'}`}>
                                                                                                        {exp.status === 'PENDING_REVIEW' ? <Clock className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <p className={`text-sm font-black ${exp.status === 'PENDING_REVIEW' ? 'text-amber-900' : 'text-emerald-900'}`}>{exp.status === 'PENDING_REVIEW' ? 'Đang được xét duyệt' : 'Đợt chi tiêu đã được xét duyệt'}</p>
                                                                                                    </div>
                                                                                                </div>)}
                                                                                                {campaign.type === 'AUTHORIZED' && exp.staffReviewId && (
                                                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-tight ml-2">
                                                                                                        <User className="w-3.5 h-3.5" />
                                                                                                        <span>Nhân viên duyệt: {staffNameMap[exp.id] || `Staff #${exp.staffReviewId}`}</span>
                                                                                                    </div>
                                                                                                )}
                                                                                                <p className="text-sm font-bold text-black/60 leading-relaxed italic">
                                                                                                    {campaign.type === 'AUTHORIZED'
                                                                                                        ? (exp.status === 'PENDING_REVIEW' ? 'Kế hoạch chi tiêu của bạn đang được xét duyệt. Vui lòng đợi kết quả nhé.' : 'Kế hoạch chi tiêu của bạn đã được phê duyệt.')
                                                                                                        : ''}
                                                                                                </p>
                                                                                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/5">
                                                                                                    <div>
                                                                                                        <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Số tiền rút</label>
                                                                                                        <p className="text-xl font-black text-black tracking-tight">
                                                                                                            {(() => {
                                                                                                                const withdrawalTx = exp.transactions?.find((t: any) =>
                                                                                                                    t.type === 'WITHDRAWAL' ||
                                                                                                                    t.type === 'DISBURSEMENT' ||
                                                                                                                    t.type === 'PAYOUT'
                                                                                                                );
                                                                                                                const amount = withdrawalTx ? withdrawalTx.amount : (exp.totalAmount || exp.totalReceivedAmount || 0);
                                                                                                                return new Intl.NumberFormat('vi-VN').format(amount);
                                                                                                            })()} đ
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    {exp.evidenceDueAt && (
                                                                                                        <div>
                                                                                                            <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block mb-1">Hạn nộp minh chứng</label>
                                                                                                            <p className="text-sm font-black text-rose-500">{new Date(exp.evidenceDueAt).toLocaleDateString('vi-VN')}</p>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="text-center py-10 space-y-4">
                                                                                                <Clock className="w-12 h-12 text-black/10 mx-auto" />
                                                                                                <p className="text-sm font-bold text-black/40">Đợt chi tiêu này chưa đóng hoặc chưa gửi yêu cầu rút tiền.</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {selectedLogStep === 3 && (
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">MINH CHỨNG CHI TIÊU</h4>
                                                                                    </div>

                                                                                    {exp.disbursementProofUrl && (
                                                                                        <div className="bg-white p-4 rounded-2xl border border-black/5">
                                                                                            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Minh chứng giải ngân (Admin)</p>
                                                                                            <div className="flex items-center gap-4">
                                                                                                <a href={exp.disbursementProofUrl} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                                                                    <Image src={exp.disbursementProofUrl} alt="Disbursement" fill className="object-cover" unoptimized />
                                                                                                </a>
                                                                                                <div className="flex-1">
                                                                                                    <p className="text-xs font-bold text-gray-900">Tiền đã được chuyển vào tài khoản</p>
                                                                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-black">{exp.disbursedAt ? new Date(exp.disbursedAt).toLocaleString('vi-VN') : '—'}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {evidences.length > 0 ? (
                                                                                        <div className="space-y-3">
                                                                                            {evidences.map((ev: any, idx: number) => (
                                                                                                <div key={ev.id || idx} className="bg-white p-3 rounded-2xl border border-black/5 shadow-sm space-y-2">
                                                                                                    <div className="flex items-center justify-between">
                                                                                                        <div className="flex items-center gap-3">
                                                                                                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 font-bold text-sm">#{idx + 1}</div>
                                                                                                            <div className="flex flex-col">
                                                                                                                <p className="text-sm font-black text-black">Số tiền: -{new Intl.NumberFormat('vi-VN').format(Math.abs(ev.amount))} VND</p>
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                    <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{ev.status === 'APPROVED' ? 'Đã xác nhận' : ''}</p>
                                                                                                                    {ev.dueAt && (
                                                                                                                        <span className="text-xs font-black text-rose-500">Hạn nộp: {new Date(ev.dueAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <button
                                                                                                            onClick={(e) => {
                                                                                                                e.stopPropagation();
                                                                                                                if (ev.proofUrl) {
                                                                                                                    window.open(ev.proofUrl, '_blank');
                                                                                                                } else {
                                                                                                                    handleOpenPostForEvidence(exp, ev);
                                                                                                                }
                                                                                                            }}
                                                                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${ev.proofUrl ? 'bg-zinc-100 border-zinc-200 text-zinc-500' : 'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-100 animate-pulse'}`}
                                                                                                        >
                                                                                                            {ev.proofUrl ? 'Xem minh chứng' : 'Nộp ngay'}
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    {ev.description && (
                                                                                                        <div className="bg-slate-50 p-3 rounded-xl border border-black/5">
                                                                                                            <p className="text-[10px] text-gray-500 italic leading-relaxed">"{ev.description}"</p>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {ev.proofUrl && (
                                                                                                        <a href={ev.proofUrl} target="_blank" rel="noopener noreferrer" className="block text-[10px] font-bold text-blue-500 hover:underline">🔗 Xem bài viết minh chứng</a>
                                                                                                    )}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-3xl">
                                                                                            <Clock className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang đợi giao dịch giải ngân</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            {selectedLogStep === 4 && (
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">TỔNG KẾT THỰC CHI</h4>
                                                                                    </div>

                                                                                    <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
                                                                                        <div className="grid grid-cols-2 gap-6">
                                                                                            <div className="space-y-1">
                                                                                                <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block">Số lần đã rút tiền</label>
                                                                                                <p className="text-lg font-black text-gray-900">{exp.evidences?.length || 0} lần</p>
                                                                                            </div>
                                                                                            <div className="space-y-1">
                                                                                                <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block">Tổng tiền thực rút</label>
                                                                                                <p className="text-lg font-black text-emerald-600">
                                                                                                    {new Intl.NumberFormat('vi-VN').format(
                                                                                                        (exp.evidences || []).reduce((sum: number, ev: any) => sum + Math.abs(ev.amount || 0), 0)
                                                                                                    )} đ
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        {exp.status === 'DISBURSED' && (
                                                                                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                                                                                <p className="text-[10px] font-medium text-orange-800 leading-relaxed italic">
                                                                                                    Bạn cần cập nhật số liệu thực tế đã mua và đăng bài viết tổng kết cuối cùng để hoàn tất đợt chi tiêu này.
                                                                                                </p>
                                                                                            </div>
                                                                                        )}

                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                router.push(`/account/campaigns/expenditures/update/${exp.id}?campaignId=${campaign.id}`);
                                                                                            }}
                                                                                            className="w-full py-4 bg-black text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[2px] hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 shadow-xl"
                                                                                        >
                                                                                            <Edit3 className="w-4 h-4" />
                                                                                            {exp.status === 'CLOSED' ? 'Xem / Chỉnh sửa thực chi' : 'Cập nhật thực chi & Tổng kết'}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-auto pt-6 border-t border-black/5 flex gap-4">
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); router.push(`/account/campaigns/expenditures/${exp.id}?campaignId=${campaign.id}`); }}
                                                                                className="flex-1 p-4 rounded-3xl bg-black text-white hover:bg-emerald-900 transition-all duration-500 shadow-2xl shadow-black/10 flex items-center justify-between group"
                                                                            >
                                                                                <span className="text-[10px] font-black uppercase tracking-[2.5px]">Xem tổng quan đợt chi tiêu </span>
                                                                                <ArrowUpRight className="w-5 h-5" />
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
    );
}
