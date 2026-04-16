'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, ShieldCheck, FileSignature, ArrowRight, Printer, AlertCircle, MessageSquare, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { campaignService } from '@/services/campaignService';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContextProxy';
import html2pdf from 'html2pdf.js';

const FALLBACK_IMAGE = '/assets/img/commitment.jpg';

export default function StaffCommitmentsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'SIGNED' | 'PENDING'>('ALL');
    const [exportingId, setExportingId] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const router = useRouter();
    const { user: staffUser } = useAuth();

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (pageNum: number) => {
        try {
            setLoading(true);
            const res = await campaignService.getAll(pageNum, 20); // Get 20 campaigns per page
            const content = res.content || [];
            
            // Filter locally for now based on status requirements
            const validDrafts = content.filter(c => !['DRAFT', 'REJECTED'].includes(c.status));

            // Enhance with signing status and author names
            const enhanced = await Promise.all(validDrafts.map(async (c) => {
                const isSigned = await campaignService.isCommitmentSigned(c.id);
                const ownerId = c.fundOwnerId || (c as any).userId;
                
                let fullName = '';
                if (ownerId) {
                    try {
                        const userRes = await userService.getUserById(ownerId);
                        if (userRes.success && userRes.data) {
                            const u = userRes.data as any;
                            fullName = u.fullName || u.data?.fullName || u.fullname || u.name;
                        }
                    } catch {}
                }
                
                return { 
                    ...c, 
                    isSigned, 
                    authorName: fullName || c.authorName || c.fundOwnerName || `Chủ quỹ #${ownerId || '?'}` 
                };
            }));

            setCampaigns(enhanced);
            setTotalPages(res.totalPages || 0);
        } catch {
            toast.error('Không thể tải danh sách cam kết');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return campaigns.filter(c => {
            const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (c.authorName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchFilter = filter === 'ALL' || (filter === 'SIGNED' ? c.isSigned : !c.isSigned);
            return matchSearch && matchFilter;
        });
    }, [campaigns, searchTerm, filter]);

    const handleExportPDF = async (camp: any) => {
        setExportingId(camp.id);
        const loadingToast = toast.loading(`Đang tải bản PDF...`);
        try {
            const data = await campaignService.getCommitment(camp.id);
            if (!data || !data.signatureUrl) throw new Error("Chưa có chữ ký");

            const container = document.createElement('div');
            container.style.position = 'absolute'; container.style.left = '-9999px';
            container.style.width = '800px'; container.style.padding = '60px';
            container.style.fontFamily = 'serif'; container.style.backgroundColor = 'white';
            
            const today = new Date();
            container.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="font-weight: bold; margin:0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                    <h3 style="font-weight: bold; border-bottom: 1px solid black; display: inline-block; padding-bottom: 2px;">Độc lập – Tự do – Hạnh phúc</h3>
                </div>
                <div style="text-align: right; font-style: italic; margin-bottom: 30px;">
                    TP. Hồ Chí Minh, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}
                </div>
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-weight: bold; font-size: 24px;">BẢN CAM KẾT TRÁCH NHIỆM</h1>
                    <div style="font-weight: bold; font-size: 14px; margin-top: 5px;">Chiến dịch: ${camp.title.toUpperCase()}</div>
                </div>
                <div style="margin-bottom: 20px; font-weight: bold;">Kính gửi: BAN QUẢN TRỊ HỆ THỐNG GÂY QUỸ TỪ THIỆN TRUSTFUNDME</div>
                <div style="margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
                    <p><b>Họ và tên:</b> ${data.fullName || 'N/A'}</p>
                    <p><b>Địa chỉ:</b> ${data.address || 'N/A'}</p>
                    <p><b>Số CCCD/CMND:</b> ${data.idNumber || 'N/A'}</p>
                    <p><b>Số điện thoại:</b> ${data.phoneNumber || 'N/A'}</p>
                </div>
                <div style="margin-bottom: 40px; font-size: 13px; text-align: justify; line-height: 1.5;">
                    <p>Tôi xin cam kết sử dụng số tiền quyên góp được đúng mục đích, minh bạch thông tin và chịu hoàn toàn trách nhiệm trước pháp luật dựa trên các điều khoản đã được quy định trong quy trình phê duyệt của TrustFundMe.</p>
                </div>
                <div style="float: right; text-align: center; width: 250px;">
                    <p style="font-weight: bold; margin-bottom: 10px;">NGƯỜI LẬP CAM KẾT</p>
                    <img src="${data.signatureUrl}" style="max-height: 80px; max-width: 200px; margin-bottom: 5px;" />
                    <p style="font-weight: bold; text-transform: uppercase; margin-top: 10px;">${data.fullName || ''}</p>
                </div>
            `;
            document.body.appendChild(container);

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Cam-Ket-TF-${camp.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().from(container).set(opt).save();
            document.body.removeChild(container);
            toast.success("Tải xuống thành công!", { id: loadingToast });
        } catch (e: any) {
            toast.error(e.message || "Lỗi khi tải PDF", { id: loadingToast });
        } finally {
            setExportingId(null);
        }
    };

    const handleChat = async (fundOwnerId: number, campaignId: number) => {
        try {
            // First check if an existing conversation exists for this campaign
            const checkRes = await chatService.getConversationByCampaignId(campaignId);
            
            if (checkRes.success && checkRes.data) {
                // If found, redirect to existing conversation
                router.push(`/staff/chat?conversationId=${checkRes.data.id}`);
                return;
            }

            // Otherwise, create a new one
            const res = await chatService.createConversation(fundOwnerId, campaignId);
            if (res.success && res.data) {
                router.push(`/staff/chat?conversationId=${res.data.id}`);
            } else {
                toast.error(res.error || 'Lỗi khi mở cuộc hội thoại');
            }
        } catch (e) {
            console.error('Chat error:', e);
            toast.error('Lỗi khi mở cuộc hội thoại');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white p-4 lg:p-6 overflow-hidden">
            {/* Standard Staff Header Bar */}
            <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                    {([
                        { val: 'ALL', label: 'Tất cả' },
                        { val: 'SIGNED', label: 'Đã ký' },
                        { val: 'PENDING', label: 'Chờ ký' }
                    ] as const).map(b => (
                        <button
                            key={b.val}
                            onClick={() => setFilter(b.val)}
                            className={`inline-flex h-9 items-center rounded-full border px-5 text-xs font-bold uppercase tracking-widest transition-all ${
                                filter === b.val 
                                ? 'border-[#446b5f]/40 bg-[#446b5f]/10 text-[#446b5f] shadow-sm' 
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên chiến dịch hoặc chủ quỹ..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#446b5f]/10 bg-white w-[350px]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between px-1 flex-shrink-0 mt-6 mb-4">
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Danh sách cam kết pháp lý</h2>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filtered.length} chiến dịch</span>
            </div>

            {/* List section - scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="">

                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50 py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-[#446b5f]" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#446b5f]">Đang đồng bộ dữ liệu...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30 py-20">
                            <AlertCircle className="h-12 w-12 text-gray-300" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Không thấy dữ liệu</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pb-6">
                            {filtered.map(camp => (
                                <div 
                                    key={camp.id} 
                                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-[#446b5f] hover:shadow-lg"
                                >
                                    {/* Photo Container */}
                                    <div className="aspect-[16/10] relative overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img 
                                            src={camp.coverImageUrl || FALLBACK_IMAGE} 
                                            alt={camp.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                        />
                                    </div>

                                    {/* Content section */}
                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2.5">
                                            <div className="flex items-start justify-between gap-1.5">
                                                <h3 className="text-gray-900 font-bold text-[12px] uppercase tracking-tight leading-[1.3] line-clamp-2 min-h-[2.6em]">
                                                    {camp.title}
                                                </h3>
                                                <div className={`flex-shrink-0 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                    camp.isSigned 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                    {camp.isSigned ? 'Đã ký' : 'Chờ ký'}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-gray-50 pt-3 pb-1">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Chủ quỹ</p>
                                                    <p className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{camp.authorName}</p>
                                                </div>
                                                <div className="space-y-0.5 text-right">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Duyệt lúc</p>
                                                    <p className="text-xs font-bold text-gray-500">{new Date(camp.approvedAt || camp.createdAt).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nút Hành động */}
                                        <div className="flex flex-col gap-1.5 pt-2">
                                            <div className="flex gap-1.5">
                                                <button 
                                                    disabled={!camp.isSigned}
                                                    onClick={() => window.open(`/campaigns-details?id=${camp.id}`, '_blank')}
                                                    className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${
                                                        camp.isSigned 
                                                        ? 'border-gray-100 text-gray-400 hover:bg-gray-50 bg-white' 
                                                        : 'border-gray-50 text-gray-200 bg-gray-50/50 cursor-not-allowed'
                                                    }`}
                                                    title={camp.isSigned ? "Xem chiến dịch" : "Chưa thể xem (Người dùng chưa ký cam kết)"}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => router.push(`/staff/commitments/${camp.id}`)}
                                                    className="flex-1 h-8 rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-1 font-bold text-[11px] uppercase tracking-wide bg-white"
                                                    title="Xem biên bản cam kết"
                                                >
                                                    <FileText className="h-3.5 w-3.5" /> Biên bản
                                                </button>
                                            </div>
                                            
                                            <div className="flex gap-1.5">
                                                <button 
                                                    onClick={() => handleChat(camp.fundOwnerId, camp.id)}
                                                    className="flex-1 h-8 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-1 font-bold text-[11px] uppercase tracking-wide bg-white"
                                                >
                                                    <MessageSquare className="h-4 w-4" /> Liên hệ
                                                </button>
                                                
                                                {camp.isSigned ? (
                                                        <button 
                                                            onClick={() => handleExportPDF(camp)}
                                                            disabled={exportingId === camp.id}
                                                            className="flex-1 h-8 rounded-lg bg-[#446b5f] text-white hover:bg-[#3a5c51] transition-all flex items-center justify-center gap-1 font-bold text-[11px] uppercase tracking-wide shadow-sm shadow-green-900/10"
                                                        >
                                                            {exportingId === camp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                                                            Xuất PDF
                                                        </button>
                                                    ) : (
                                                        <div className="flex-1 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center gap-1 font-bold text-[11px] uppercase tracking-wide border border-gray-100 italic">
                                                            Khóa
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Phân trang - Tối giản, không che khuất */}
            <div className="flex-shrink-0 flex items-center justify-center gap-2 py-2 border-t border-gray-100 bg-white">
                <button
                    disabled={page === 0 || loading}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-xl border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    Trước
                </button>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all ${
                                page === i 
                                ? 'bg-[#446b5f] text-white shadow-lg shadow-green-900/10' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button
                    disabled={page === totalPages - 1 || totalPages === 0 || loading}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-xl border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    Sau
                </button>
            </div>
        </div>
    );
}
