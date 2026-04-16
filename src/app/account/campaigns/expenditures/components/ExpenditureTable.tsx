import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    FileText, Plus, CheckCircle, X, AlertCircle, ArrowUpRight,
    Clock, ShieldCheck, DollarSign, Receipt, Image as ImageIcon,
    User, Send
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
        switch (status) {
            case 'PENDING': return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] uppercase tracking-widest border border-gray-200">Đang chờ xử lý</span>;
            case 'APPROVED': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] uppercase tracking-widest border border-blue-100">Đã cập nhật thực tế</span>;
            case 'PENDING_REVIEW': return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] uppercase tracking-widest border border-amber-100">Chờ Quản trị viên duyệt</span>;
            case 'DISBURSED': return <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] uppercase tracking-widest border border-purple-100">Đã giải ngân</span>;
            case 'REJECTED': return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] uppercase tracking-widest border border-red-100">Bị từ chối</span>;
            case 'CLOSED': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] uppercase tracking-widest border border-emerald-100">Đã hoàn tất</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] uppercase tracking-widest border border-gray-200">{status}</span>;
        }
    };

    return (
                
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
                                <div className="w-full max-h-[500px] overflow-y-auto">        
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
                                                                                                    <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 1 ? 'text-emerald-900' : 'text-emerald-700'}`}>        
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
                                                                                                <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${exp.status === 'REJECTED' ? 'bg-rose-500 ring-4 ring-rose-50' : (exp.isWithdrawalRequested ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50')}`}></div>        
                                                                                                <div className="flex flex-col">        
                                                                                                    <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 2 ? 'text-emerald-900' : (exp.status === 'REJECTED' ? 'text-rose-600' : (exp.status === 'PENDING_REVIEW' && campaign.type === 'AUTHORIZED' ? 'text-amber-500' : (exp.isWithdrawalRequested || (campaign.type === 'AUTHORIZED' && exp.status !== 'PENDING_REVIEW') ? 'text-emerald-700' : 'text-orange-400')))}`}>        
                                                                                                        2. {exp.status === 'REJECTED' ? 'Bị từ chối' : (campaign.type === 'AUTHORIZED' ? (exp.status === 'PENDING_REVIEW' ? 'Đang xét duyệt' : 'Đã duyệt') : 'Yêu cầu rút tiền')}        
                                                                                                    </span>        
                                                                                                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">        
                                                                                                        {exp.status === 'REJECTED' ? 'Đã phản hồi' : (campaign.type === 'AUTHORIZED' ? (exp.status === 'PENDING_REVIEW' ? 'Đang xử lý' : 'Đã thực hiện') : (exp.isWithdrawalRequested ? 'Đã thực hiện' : 'Chưa thực hiện'))}        
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
                                                                                                        <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${(exp.disbursedAt || exp.status === 'DISBURSED') ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50'}`}></div>        
                                                                                                        <div className="flex flex-col">        
                                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 3 ? 'text-emerald-900' : ((exp.disbursedAt || exp.status === 'DISBURSED') ? 'text-emerald-700' : 'text-orange-400')}`}>        
                                                                                                                3. Admin giải ngân        
                                                                                                            </span>        
                                                                                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wide">        
                                                                                                                {(exp.disbursedAt || exp.status === 'DISBURSED') ? 'Đã chuyển tiền' : 'Đang xử lý'}        
                                                                                                            </span>        
                                                                                                        </div>        
                                                                                                    </button>        
                
                                                                                                    {/* Step 4: Minh chứng & Hoàn tiền */}        
                                                                                                    <button        
                                                                                                        onClick={(e) => { e.stopPropagation(); setSelectedLogStep(4); }}        
                                                                                                        className={`w-full text-left relative group/log transition-all duration-300 p-4 rounded-2xl ${selectedLogStep === 4 ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}        
                                                                                                    >        
                                                                                                        <div className={`absolute -left-[32px] top-6 w-2.5 h-2.5 rounded-full z-10 ${(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-orange-300 ring-4 ring-orange-50'}`}></div>        
                                                                                                        <div className="flex flex-col">        
                                                                                                            <span className={`text-sm font-black block leading-none mb-2 ${selectedLogStep === 4 ? 'text-emerald-900' : ((exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') ? 'text-emerald-700' : 'text-orange-400')}`}>        
                                                                                                                4. Minh chứng & Hoàn tiền        
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
                
                                                                                    {/* Column 2: DETAIL - Nội dung chi tiết */}        
                                                                                    <div className="flex flex-col lg:pl-12 lg:border-l border-black/5 min-h-[400px]">        
                                                                                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">        
                                                                                            {selectedLogStep === 1 && (        
                                                                                                <div className="space-y-8">        
                                                                                                    <div className="flex items-center justify-between">        
                                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">CHI TIẾT KHỞI TẠO</h4>        
                                                                                                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Hoàn tất</span>        
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
                                                                                                <div className="space-y-8">        
                                                                                                    <div className="flex items-center justify-between">        
                                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-red-900/40">{exp.status === 'REJECTED' ? 'KẾT QUẢ PHẢN HỒI' : (campaign.type === 'AUTHORIZED' && exp.staffReviewId ? 'XÉT DUYỆT CHI TIÊU' : 'YÊU CẦU RÚT TIỀN')}</h4>        
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
                                                                                                                        <span>Người xét duyệt: {staffNameMap[exp.id] || (exp.staffReviewId ? `Staff #${exp.staffReviewId}` : 'Hệ thống')}</span>        
                                                                                                                    </div>        
                                                                                                                </div>        
                                                                                                            </div>        
                                                                                                        ) : (exp.isWithdrawalRequested || (campaign.type === 'AUTHORIZED' && exp.staffReviewId)) ? (        
                                                                                                            <div className="space-y-6">        
                                                                                                                <div className={`flex items-center gap-4 p-4 rounded-2xl border ${exp.status === 'PENDING_REVIEW' ? 'bg-amber-50 border-amber-100' : 'bg-orange-50 border-emerald-100'}`}>        
                                                                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${exp.status === 'PENDING_REVIEW' ? 'bg-amber-400' : 'bg-orange-400'}`}>        
                                                                                                                        {exp.status === 'PENDING_REVIEW' ? <Clock className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}        
                                                                                                                    </div>        
                                                                                                                    <div>        
                                                                                                                        <p className={`text-sm font-black ${exp.status === 'PENDING_REVIEW' ? 'text-amber-900' : 'text-emerald-900'}`}>{campaign.type === 'AUTHORIZED' ? (exp.status === 'PENDING_REVIEW' ? 'Đang được xét duyệt' : 'Khoản chi đã được xét duyệt') : 'Yêu cầu đã được ghi nhận'}</p>        
                                                                                                                    </div>        
                                                                                                                </div>        
                                                                                                                {campaign.type === 'AUTHORIZED' && exp.staffReviewId && (        
                                                                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-tight ml-2">        
                                                                                                                        <User className="w-3.5 h-3.5" />        
                                                                                                                        <span>Nhân viên duyệt: {staffNameMap[exp.id] || `Staff #${exp.staffReviewId}`}</span>        
                                                                                                                    </div>        
                                                                                                                )}        
                                                                                                                <p className="text-sm font-bold text-black/60 leading-relaxed italic">        
                                                                                                                    {campaign.type === 'AUTHORIZED'        
                                                                                                                        ? (exp.status === 'PENDING_REVIEW' ? 'Kế hoạch chi tiêu của bạn đang được xét duyệt. Vui lòng đợi kết quả nhé.' : 'Kế hoạch chi tiêu của bạn đã được phê duyệt. Hệ thống đang tiến hành các bước giải ngân.')        
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
                                                                                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã giải ngân</span>        
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
                                                                                                                <div className="absolute top-6 right-6 px-3 py-1.5 bg-orange-400 text-white text-[8px] font-black uppercase tracking-widest rounded-xl shadow-lg">Transaction Verified</div>        
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
                                                                                                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-orange-900/40">MINH CHỨNG & HOÀN TIỀN</h4>        
                                                                                                        {(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') && (        
                                                                                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-orange-100">Đã nộp</span>        
                                                                                                        )}        
                                                                                                    </div>        
                
                                                                                                    {(exp.evidenceStatus !== 'SUBMITTED' && exp.evidenceStatus !== 'APPROVED') && (        
                                                                                                        <EvidenceDeadlineBanner dueAt={exp.evidenceDueAt || ''} />        
                                                                                                    )}        
                
                                                                                                    {(exp.evidenceStatus === 'SUBMITTED' || exp.evidenceStatus === 'APPROVED') && (        
                                                                                                        <div className="flex items-center gap-4 px-6 py-5 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] transition-all duration-500 shadow-sm">        
                                                                                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">        
                                                                                                                <CheckCircle className="w-6 h-6 text-emerald-500" />        
                                                                                                            </div>        
                                                                                                            <div>        
                                                                                                                <p className="text-xs font-black text-emerald-900 uppercase tracking-widest leading-none mb-1.5">Đã nộp minh chứng</p>        
                                                                                                                {exp.evidenceSubmittedAt && (        
                                                                                                                    <p className="text-sm font-black text-emerald-800/60">        
                                                                                                                        Lúc {new Date(exp.evidenceSubmittedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}        
                                                                                                                    </p>        
                                                                                                                )}        
                                                                                                            </div>        
                                                                                                        </div>        
                                                                                                    )}        
                
                                                                                                    {/* Phần Minh chứng */}        
                                                                                                    {(exp.evidenceStatus === 'PENDING' || !exp.evidenceStatus || exp.evidenceStatus === 'ALLOWED_EDIT') && (        
                                                                                                        <div className="space-y-4">        
                                                                                                            {/* Bước 4: Cập nhật thực tế & ảnh */}        
                                                                                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 group/step">        
                                                                                                                <div className="flex items-center gap-4">        
                                                                                                                    {(() => {        
                                                                                                                        const isUpdated = (exp.totalAmount || 0) > 0;        
                                                                                                                        return (        
                                                                                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isUpdated ? 'bg-emerald-100' : 'bg-white/50'}`}>        
                                                                                                                                <Receipt className={`w-5 h-5 ${isUpdated ? 'text-emerald-500' : 'text-orange-400'}`} />        
                                                                                                                            </div>        
                                                                                                                        );        
                                                                                                                    })()}        
                                                                                                                    <div>        
                                                                                                                        <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Thực tế & Minh chứng</p>        
                                                                                                                        <p className="text-[10px] text-black/40 leading-tight">Cập nhật số lượng, đơn giá thực tế và hóa đơn</p>        
                                                                                                                    </div>        
                                                                                                                </div>        
                                                                                                                <button        
                                                                                                                    onClick={() => handleOpenUpdateModal(exp)}        
                                                                                                                    disabled={exp.transactions?.some((t: any) => t.type === 'REFUND' && t.status === 'COMPLETED')}        
                                                                                                                    className={`px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-full active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${exp.transactions?.some((t: any) => t.type === 'REFUND' && t.status === 'COMPLETED') ? 'bg-gray-300 cursor-not-allowed' : ((exp.totalAmount || 0) > 0 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-400 hover:bg-orange-500')}`}        
                                                                                                                >        
                                                                                                                    {exp.transactions?.some((t: any) => t.type === 'REFUND' && t.status === 'COMPLETED') ? 'Đã hoàn tiền dư' : ((exp.totalAmount || 0) > 0 ? 'Chỉnh sửa' : 'Cập nhật')}        
                                                                                                                </button>        
                                                                                                            </div>        
                
                                                                                                            {/* Bước 5: Chia sẻ lên bảng tin */}        
                                                                                                            {(() => {        
                                                                                                                const posts = expenditurePosts[exp.id] || [];        
                                                                                                                const publishedPost = posts.find((p: any) => p.status === 'PUBLISHED');        
                                                                                                                const draftPost = posts.find((p: any) => p.status === 'DRAFT');        
                                                                                                                const isPublished = !!publishedPost;        
                                                                                                                const isStepDone = posts.some((p: any) => p.status === 'PUBLISHED' || p.status === 'DRAFT');        
                
                                                                                                                return (        
                                                                                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 group/step">        
                                                                                                                        <div className="flex items-center gap-4">        
                                                                                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isStepDone ? 'bg-emerald-100' : 'bg-white/50'}`}>        
                                                                                                                                <ImageIcon className={`w-5 h-5 ${isStepDone ? 'text-emerald-500' : 'text-orange-400'}`} />        
                                                                                                                            </div>        
                                                                                                                            <div>        
                                                                                                                                <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Đăng bài post</p>        
                                                                                                                                <p className="text-[10px] text-black/40 leading-tight">        
                                                                                                                                    {isPublished        
                                                                                                                                        ? `Đã đăng lúc ${new Date(publishedPost.updatedAt || publishedPost.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`        
                                                                                                                                        : draftPost        
                                                                                                                                            ? 'Bài nháp đang chờ — bấm để tiếp tục sửa'        
                                                                                                                                            : 'Chia sẻ minh chứng lên bảng tin để cộng đồng theo dõi'}        
                                                                                                                                </p>        
                                                                                                                            </div>        
                                                                                                                        </div>        
                                                                                                                        <button        
                                                                                                                            onClick={() => {        
                                                                                                                                setCurrentDraftPost(draftPost || publishedPost || null);        
                                                                                                                                setPostExpenditure(exp);        
                                                                                                                                setIsPostModalOpen(true);        
                                                                                                                            }}        
                                                                                                                            className={`px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-full active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${isStepDone ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-400 hover:bg-orange-500'}`}        
                                                                                                                        >        
                                                                                                                            {isPublished ? 'Sửa bài' : draftPost ? 'Tiếp tục' : 'Viết bài'}        
                                                                                                                        </button>        
                                                                                                                    </div>        
                                                                                                                );        
                                                                                                            })()}        
                
                                                                                                            {/* Phần Hoàn tiền dư (Được dời lên trước nút Nộp) */}        
                                                                                                            {exp.status === 'DISBURSED' && (        
                                                                                                                <div className="pt-4 border-t border-black/5 space-y-4">        
                                                                                                                    <div className="flex items-center gap-3">        
                                                                                                                        <h4 className="text-[9px] font-black uppercase tracking-[2px] text-orange-900/40">HOÀN TIỀN DƯ</h4>        
                                                                                                                        {(() => {        
                                                                                                                            const refundTx = exp.transactions?.find((t: any) => t.type === 'REFUND');        
                                                                                                                            if (refundTx?.status === 'COMPLETED') {        
                                                                                                                                return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[7px] font-black uppercase tracking-widest rounded-full border border-emerald-200">Đã hoàn tất</span>;        
                                                                                                                            }        
                                                                                                                            if (refundTx) {        
                                                                                                                                return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[7px] font-black uppercase tracking-widest rounded-full border border-gray-200 animate-pulse">Đang xử lý</span>;        
                                                                                                                            }        
                                                                                                                            return null;        
                                                                                                                        })()}        
                                                                                                                    </div>        
                
                                                                                                                    {(() => {        
                                                                                                                        const refundTx = exp.transactions?.find((t: any) => t.type === 'REFUND' && t.status !== 'FAILED');        
                                                                                                                        const variance = (exp.variance != null) ? Number(exp.variance) : ((exp.totalExpectedAmount || 0) - (exp.totalAmount || 0));        
                                                                                                                        const needRefund = variance > 0;        
                                                                                                                        const isActualsUpdated = (exp.totalAmount || 0) > 0;        
                                                                                                                        const isRefunded = refundTx?.status === 'COMPLETED';        
                
                                                                                                                        if (refundTx) {        
                                                                                                                            return (        
                                                                                                                                <div className="space-y-3">        
                                                                                                                                    <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isRefunded ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-200'}`}>        
                                                                                                                                        <div className="flex items-center gap-4">        
                                                                                                                                            <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">        
                                                                                                                                                <CheckCircle className={`w-5 h-5 ${isRefunded ? 'text-emerald-500' : 'text-amber-500'}`} />        
                                                                                                                                            </div>        
                                                                                                                                            <div>        
                                                                                                                                                <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Hoàn tiền dư</p>        
                                                                                                                                                <p className={`text-[10px] font-bold ${isRefunded ? 'text-emerald-600/60' : 'text-amber-600/60'}`}>        
                                                                                                                                                    Đã hoàn {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundTx.amount)}        
                                                                                                                                                </p>        
                                                                                                                                            </div>        
                                                                                                                                        </div>        
                                                                                                                                        {isRefunded ? (        
                                                                                                                                            refundTx.proofUrl && (        
                                                                                                                                                <div className="w-20 h-14 rounded-xl border border-emerald-100 overflow-hidden shadow-sm hover:scale-105 transition-transform cursor-pointer relative group bg-white p-0.5" onClick={() => { /* Open image zoom */ }}>        
                                                                                                                                                    <img src={refundTx.proofUrl} alt="Minh chứng hoàn tiền" className="w-full h-full object-cover rounded-lg" />        
                                                                                                                                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">        
                                                                                                                                                        <ImageIcon className="w-4 h-4 text-white drop-shadow-md" />        
                                                                                                                                                    </div>        
                                                                                                                                                </div>        
                                                                                                                                            )        
                                                                                                                                        ) : (        
                                                                                                                                            <button        
                                                                                                                                                onClick={() => {        
                                                                                                                                                    setRefundExpenditure(exp);        
                                                                                                                                                    setRefundAmount(Math.max(0, variance).toString());        
                                                                                                                                                    setShowRefundModal(true);        
                                                                                                                                                }}        
                                                                                                                                                className="px-5 py-2.5 bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-orange-500 active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0"        
                                                                                                                                            >        
                                                                                                                                                Cập nhật        
                                                                                                                                            </button>        
                                                                                                                                        )}        
                                                                                                                                    </div>        
                                                                                                                                </div>        
                                                                                                                            );        
                                                                                                                        }        
                
                                                                                                                        if (!needRefund) {        
                                                                                                                            return (        
                                                                                                                                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 flex items-center gap-4">        
                                                                                                                                    <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">        
                                                                                                                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />        
                                                                                                                                    </div>        
                                                                                                                                    <div>        
                                                                                                                                        <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Không có tiền dư</p>        
                                                                                                                                        <p className="text-[10px] text-emerald-600/60 leading-tight">Tuyệt vời! Bạn đã chi tiêu đúng hoặc vượt ngân sách ban đầu.</p>        
                                                                                                                                    </div>        
                                                                                                                                </div>        
                                                                                                                            );        
                                                                                                                        }        
                
                                                                                                                        if (!isActualsUpdated) {        
                                                                                                                            return (        
                                                                                                                                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">        
                                                                                                                                    <div className="flex items-center gap-4">        
                                                                                                                                        <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">        
                                                                                                                                            <DollarSign className="w-5 h-5 text-gray-300" />        
                                                                                                                                        </div>        
                                                                                                                                        <div>        
                                                                                                                                            <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Hoàn tiền dư</p>        
                                                                                                                                            <p className="text-[10px] text-black/40 leading-tight">Cập nhật đơn giá thực tế để hiện số tiền dư cần hoàn</p>        
                                                                                                                                        </div>        
                                                                                                                                    </div>        
                                                                                                                                    <span className="px-5 py-2.5 bg-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full cursor-not-allowed whitespace-nowrap flex-shrink-0">        
                                                                                                                                        Chưa cập nhật        
                                                                                                                                    </span>        
                                                                                                                                </div>        
                                                                                                                            );        
                                                                                                                        }        
                
                                                                                                                        return (        
                                                                                                                            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">        
                                                                                                                                <div className="flex items-center gap-4">        
                                                                                                                                    <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">        
                                                                                                                                        <DollarSign className="w-5 h-5 text-orange-400" />        
                                                                                                                                    </div>        
                                                                                                                                    <div>        
                                                                                                                                        <p className="text-sm font-black text-black/80 uppercase tracking-widest mb-0.5">Hoàn tiền dư</p>        
                                                                                                                                        <p className="text-[10px] text-black/40 leading-tight">Thực hiện hoàn trả số tiền còn dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variance)}</p>        
                                                                                                                                    </div>        
                                                                                                                                </div>        
                                                                                                                                <button        
                                                                                                                                    onClick={() => {        
                                                                                                                                        setRefundExpenditure(exp);        
                                                                                                                                        setRefundAmount(Math.max(0, variance).toString());        
                                                                                                                                        setShowRefundModal(true);        
                                                                                                                                    }}        
                                                                                                                                    className="px-5 py-2.5 bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-orange-500 active:scale-95 transition-all shadow-sm whitespace-nowrap flex-shrink-0"        
                                                                                                                                >        
                                                                                                                                    Thực hiện        
                                                                                                                                </button>        
                                                                                                                            </div>        
                                                                                                                        );        
                                                                                                                    })()}        
                                                                                                                </div>        
                                                                                                            )}        
                
                                                                                                            {/* Nút NỘP FINAL */}        
                                                                                                            <div className="flex flex-col gap-3 pt-4 border-t border-black/5">        
                                                                                                                {(() => {        
                                                                                                                    const posts = expenditurePosts[exp.id] || [];        
                                                                                                                    const hasEvidencePost = posts.length > 0;        
                                                                                                                    const isActualsUpdated = (exp.totalAmount || 0) > 0;        
                                                                                                                    const variance = (exp.variance != null) ? Number(exp.variance) : ((exp.totalExpectedAmount || 0) - (exp.totalAmount || 0));        
                                                                                                                    const needRefund = variance > 0;        
                                                                                                                    const isRefundDone = exp.transactions?.some((t: any) => t.type === 'REFUND' && t.status === 'COMPLETED');        
                
                                                                                                                    const isReady = isActualsUpdated && hasEvidencePost && (!needRefund || isRefundDone);        
                
                                                                                                                    const reasons = [];        
                                                                                                                    if (!isActualsUpdated) reasons.push("Chưa cập nhật số liệu thực tế");        
                                                                                                                    if (!hasEvidencePost) reasons.push("Chưa chuẩn bị bài chia sẻ minh chứng");        
                                                                                                                    if (needRefund && !isRefundDone) reasons.push("Chưa hoàn tất hoàn tiền dư");        
                
                                                                                                                    return (        
                                                                                                                        <>        
                                                                                                                            <button        
                                                                                                                                onClick={async () => {        
                                                                                                                                    if (!isReady) return;        
                                                                                                                                    try {        
                                                                                                                                        setUploadingEvidence(true);        
                                                                                                                                        const draftPost = posts.find((p: any) => p.status === 'DRAFT');        
                                                                                                                                        if (draftPost) {        
                                                                                                                                            await feedPostService.updateStatus(Number(draftPost.id), 'PUBLISHED');        
                                                                                                                                        }        
                                                                                                                                        await expenditureService.updateEvidenceStatus(exp.id, 'SUBMITTED');        
                                                                                                                                        toast.success('Đã nộp minh chứng thành công!');        
                                                                                                                                        fetchData();        
                                                                                                                                    } catch (err: any) {        
                                                                                                                                        toast.error(err.response?.data?.message || 'Nộp minh chứng thất bại.');        
                                                                                                                                    } finally {        
                                                                                                                                        setUploadingEvidence(false);        
                                                                                                                                    }        
                                                                                                                                }}        
                                                                                                                                disabled={uploadingEvidence || !isReady}        
                                                                                                                                className={`w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 ${isReady ? 'bg-orange-400 hover:bg-orange-500' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}        
                                                                                                                            >        
                                                                                                                                {uploadingEvidence ? (        
                                                                                                                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang nộp...</>        
                                                                                                                                ) : (        
                                                                                                                                    <><Send className="w-4 h-4" /> NỘP MINH CHỨNG</>        
                                                                                                                                )}        
                                                                                                                            </button>        
                                                                                                                            {!isReady && (        
                                                                                                                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">        
                                                                                                                                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">        
                                                                                                                                        <AlertCircle className="w-3 h-3" /> Cần hoàn thành các bước sau:        
                                                                                                                                    </p>        
                                                                                                                                    <ul className="space-y-1">        
                                                                                                                                        {reasons.map((r, i) => (        
                                                                                                                                            <li key={i} className="text-[9px] font-bold text-amber-600/70 flex items-center gap-2">        
                                                                                                                                                <div className="w-1 h-1 rounded-full bg-amber-300" /> {r}        
                                                                                                                                            </li>        
                                                                                                                                        ))}        
                                                                                                                                    </ul>        
                                                                                                                                </div>        
                                                                                                                            )}        
                                                                                                                        </>        
                                                                                                                    );        
                                                                                                                })()}        
                                                                                                            </div>        
                                                                                                        </div>        
                                                                                                    )}        
                
                
                                                                                                </div>        
                                                                                            )}        
                                                                                        </div>        
                                                                                        <div className="mt-auto pt-10 border-t border-black/5 flex gap-4">        
                                                                                            <button        
                                                                                                onClick={(e) => { e.stopPropagation(); router.push(`/account/campaigns/expenditures/${exp.id}?campaignId=${campaign.id}`); }}        
                                                                                                className="flex-1 p-6 rounded-[2rem] bg-black text-white hover:bg-emerald-900 transition-all duration-500 shadow-2xl shadow-black/10 flex items-center justify-between group"        
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
