'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { campaignService } from '@/services/campaignService';
import { Loader2, FileCheck, FileSignature, ArrowRight, ShieldCheck, AlertCircle, Printer, FileText, Search, X } from 'lucide-react';
import Link from 'next/link';
import AnimatedList from '@/components/common/AnimatedList';
import { useRouter } from 'next/navigation';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-hot-toast';

export default function CommitmentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportingId, setExportingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCampaigns = campaigns.filter(camp => 
        camp.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                // Fetch all campaigns owned by the user
                const userCampaigns = await campaignService.getByFundOwner(user.id);
                
                // Filter out DRAFT and REJECTED because they don't reach the commitment stage yet
                const validCampaigns = userCampaigns.filter(c => 
                    !['DRAFT', 'REJECTED'].includes(c.status)
                );

                // Fetch signature status for all valid campaigns
                const campaignsWithStatus = await Promise.all(
                    validCampaigns.map(async (camp) => {
                        try {
                            const isSigned = await campaignService.isCommitmentSigned(camp.id);
                            return { ...camp, isSigned };
                        } catch {
                            return { ...camp, isSigned: false };
                        }
                    })
                );

                setCampaigns(campaignsWithStatus);
            } catch (error) {
                console.error("Lỗi tải danh sách cam kết: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const handleExportPDF = async (campId: number, campTitle: string) => {
        setExportingId(campId);
        const loadingToast = toast.loading(`Đang khởi tạo bản PDF cho chiến dịch...`);
        try {
            const data = await campaignService.getCommitment(campId);
            if (!data || !data.signatureUrl) throw new Error("Chưa có chữ ký");

            // Tạo phần tử tạm thời để render PDF
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.width = '800px';
            container.style.padding = '60px';
            container.style.fontFamily = 'serif';
            container.style.backgroundColor = 'white';
            
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
                    <div style="font-weight: bold; font-size: 14px; margin-top: 5px;">
                        Chiến dịch: ${campTitle.toUpperCase()}
                    </div>
                </div>
                <div style="margin-bottom: 20px; font-weight: bold;">
                    Kính gửi: BAN QUẢN TRỊ HỆ THỐNG GÂY QUỸ TỪ THIỆN TRUSTFUNDME
                </div>
                <div style="margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
                    <p><b>Họ và tên:</b> ${data.fullName || 'N/A'}</p>
                    <p><b>Địa chỉ:</b> ${data.address || 'N/A'}</p>
                    <p><b>Số CCCD/CMND:</b> ${data.idNumber || 'N/A'}</p>
                    <p><b>Số điện thoại:</b> ${data.phoneNumber || 'N/A'}</p>
                </div>
                <div style="margin-bottom: 40px; font-size: 13px; text-align: justify; line-height: 1.5;">
                    <p>Tôi xin cam kết sử dụng số tiền quyên góp được đúng mục đích, minh bạch thông tin và chịu hoàn toàn trách nhiệm trước pháp luật.</p>
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
                filename: `Cam-Ket-TF-${campId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().from(container).set(opt).save();
            document.body.removeChild(container);
            toast.success("Đã tải PDF thành công!", { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error("Lỗi khi tải PDF", { id: loadingToast });
        } finally {
            setExportingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center bg-slate-50/50 rounded-2xl w-full m-8">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-[#446b5f] animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px]">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            {/* NEW PREMIUM HEADER */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-[1000] text-slate-900 uppercase tracking-tighter leading-none">
                            Biên bản cam kết
                        </h1>
                        <span className="px-3 py-1 bg-[#446b5f] text-white text-[10px] font-black rounded-full shadow-lg shadow-green-900/10">
                            {campaigns.length} BẢN GỐC
                        </span>
                    </div>
                    <p className="text-slate-400 font-medium text-sm tracking-wide">
                        Lưu trữ và quản lý tính pháp lý điện tử của các chiến dịch gây quỹ.
                    </p>
                </div>

                {/* Refined Search Bar */}
                <div className="relative w-full md:w-72 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#446b5f]">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm dự án..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-10 py-3.5 bg-slate-50/50 border border-slate-200 rounded-[20px] text-sm focus:outline-none focus:border-[#446b5f]/50 focus:bg-white transition-all font-semibold placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-4 flex items-center group/x"
                        >
                            <X className="h-4 w-4 text-slate-300 group-hover/x:text-rose-500 transition-colors" />
                        </button>
                    )}
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className="text-center py-24 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Chưa có bản cam kết nào</h3>
                    <p className="text-gray-400 max-w-md mx-auto text-sm">
                        Bạn chưa có chiến dịch nào lọt vào vòng xét duyệt cam kết. Chiến dịch cần đạt tới bước xét duyệt (PENDING) để được yêu cầu ký nhé!
                    </p>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[32px] border border-slate-100">
                    <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400 mb-1">Không tìm thấy kết quả</h3>
                    <p className="text-slate-400 text-sm italic">
                        Thử gõ một từ khóa khác xem sao nha!
                    </p>
                </div>
            ) : (
                <div className="w-full">
                    <AnimatedList 
                        items={filteredCampaigns}
                        className="!w-full px-0"
                        renderItem={(camp, index, isSelected) => (
                            <div className={`group bg-white border rounded-[24px] transition-all flex items-stretch overflow-hidden h-[120px]
                                ${isSelected ? 'border-[#446b5f]/40 bg-green-50/10' : 'border-gray-100'}`}>
                                
                                {/* Campaign Image - ĐẢM BẢO TRÀN KHUNG TỪ TRÊN XUỐNG DƯỚI */}
                                <div className="w-[180px] shrink-0 relative overflow-hidden bg-slate-50">
                                    <img 
                                        src={camp.coverImageUrl || '/assets/img/commitment.jpg'} 
                                        alt={camp.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/assets/img/commitment.jpg';
                                        }}
                                    />
                                </div>

                                <div className="flex-1 flex items-center justify-between px-8 py-2">
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#446b5f] transition-all line-clamp-1 pr-4">{camp.title}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-[6px] text-[9px] font-black uppercase tracking-widest ${
                                                camp.isSigned 
                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                    : 'bg-rose-50 text-rose-700'
                                            }`}>
                                                {camp.isSigned ? 'ĐÃ KÝ' : 'CHỜ KÝ'}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                                                {new Date(camp.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {camp.isSigned && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExportPDF(camp.id, camp.title);
                                                }}
                                                disabled={exportingId === camp.id}
                                                className="p-3 bg-white border border-gray-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center gap-2"
                                                title="Tải bản PDF"
                                            >
                                                {exportingId === camp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Tải PDF</span>
                                            </button>
                                        )}
                                        <Link 
                                           href={`/fund-owner/campaign/${camp.id}/commitment`}
                                           className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                               camp.isSigned 
                                                   ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                   : 'bg-[#446b5f] text-white hover:bg-[#355249]'
                                           }`}>
                                           {camp.isSigned ? 'Xem' : 'Ký ngay'}
                                           <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </div>
            )}

        </div>
    );
}
