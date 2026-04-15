'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Printer, FileCheck, ShieldCheck, Clock, UserCheck, Building2, AlertCircle, Timer, Edit3, X, Trash2 } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';
import SignaturePad from '@/components/common/SignaturePad';
import Grainient from '@/components/common/Grainient';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

interface KYCData {
  id: number;
  userId: number;
  fullName: string;
  address: string;
  workplace: string;
  taxId: string;
  idType: string;
  idNumber: string;
  issueDate: string;
  expiryDate: string;
  issuePlace: string;
  phoneNumber: string;
  status: string;
}

export default function CommitmentPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<UserInfo | null>(null);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signature, setSignature] = useState('');
  const [tempSignature, setTempSignature] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isSavedData, setIsSavedData] = useState(false);
  const [savedFullName, setSavedFullName] = useState('');

  const calculateTimeLeft = useCallback((updatedAt: string) => {
    const startTime = new Date(updatedAt).getTime();
    const deadline = startTime + (48 * 60 * 60 * 1000);
    const now = new Date().getTime();
    const difference = deadline - now;

    if (difference <= 0) {
      setIsExpired(true);
      return 'HẾT HẠN';
    }

    const hours = Math.floor((difference / (1000 * 60 * 60)));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaignData = await campaignService.getById(Number(id));
        setCampaign(campaignData);

        const ownerRes = await userService.getUserById(campaignData.fundOwnerId);
        if (ownerRes.success) {
          setOwnerInfo(ownerRes.data!);
        }

        try {
          const kycRes = await userService.getUserKYC(campaignData.fundOwnerId);
          if (kycRes && kycRes.id) setKycData(kycRes);
        } catch (e) {}

        try {
          const commitmentData = await campaignService.getCommitment(Number(id));
          if (commitmentData && commitmentData.signatureUrl) {
            setSignature(commitmentData.signatureUrl);
            setIsSavedData(true);
            if (commitmentData.fullName) setSavedFullName(commitmentData.fullName);
          }
        } catch (e) {}

        if (campaignData.updatedAt) setTimeLeft(calculateTimeLeft(campaignData.updatedAt));

      } catch (error) {
        toast.error('Không thể tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, calculateTimeLeft]);

  useEffect(() => {
    if (!campaign?.updatedAt || isExpired || isSavedData) return;
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(campaign.updatedAt)), 1000);
    return () => clearInterval(timer);
  }, [campaign?.updatedAt, calculateTimeLeft, isExpired, isSavedData]);

  const handleFinalizeSignature = () => {
    if (!tempSignature) {
      toast.error('Vui lòng ký vào khung trước khi hoàn tất');
      return;
    }
    setSignature(tempSignature);
    setShowSignModal(false);
    toast.success('Đã ghi nhận chữ ký!');
  };

  const clearFinalSignature = () => {
    setSignature('');
    setTempSignature('');
    toast('Đã xóa chữ ký cũ');
  };

  const handleSubmit = async () => {
    if (isExpired || !signature || isSavedData) return;
    setSubmitting(true);
    try {
      const resolvedFullName = kycData?.fullName || ownerInfo?.fullName || 'N/A';
      const payload = {
        campaignId: Number(id),
        userId: currentUser?.id,
        fullName: resolvedFullName,
        address: kycData?.address || '',
        workplace: kycData?.workplace || '',
        taxId: kycData?.taxId || '',
        idNumber: kycData?.idNumber || 'Đã xác thực KYC',
        issuePlace: kycData?.issuePlace || '',
        issueDate: kycData?.issueDate ? new Date(kycData.issueDate) : null,
        phoneNumber: kycData?.phoneNumber || ownerInfo?.phoneNumber || 'N/A',
        content: `Bản cam kết trách nhiệm cho chiến dịch "${campaign?.title}"`,
        signatureUrl: signature,
        status: 'SIGNED',
      };
      await campaignService.signCommitment(payload);
      toast.success('Nộp bản cam kết thành công!');
      setIsSavedData(true);
      setSavedFullName(resolvedFullName);
      setShowSuccessModal(true);
    } catch (error) {
      toast.error('Lỗi khi nộp bản cam kết');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );

  const handleExportPDF = () => {
    const element = document.getElementById('legal-document');
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `commitment-TF-${id}-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const loadingToast = toast.loading('Đang khởi tạo bản PDF...');
    
    // Hide components that shouldn't be in PDF if any (handled by CSS no-print usually but html2pdf might need more care)
    // Actually html2pdf uses html2canvas, so it sees what's on screen.
    
    html2pdf().from(element).set(opt).save().then(() => {
      toast.success('Đã tải bản PDF thành công!', { id: loadingToast });
    }).catch((err: any) => {
      console.error('PDF Export Error:', err);
      toast.error('Lỗi khi xuất PDF', { id: loadingToast });
    });
  };

  const today = new Date();

  return (
    <div className="min-h-screen relative flex justify-center py-12 px-6 bg-slate-50 overflow-x-hidden">
      
      {/* BACKGROUND EFFECT - LIGHTER & SUBTLE */}
      <div className="fixed inset-0 z-0 opacity-40">
        <Grainient
          color1="#ffffff" 
          color2="#f8fafc" 
          color3="#e2e8f0" 
          timeSpeed={0.8}
          warpSpeed={2.5}
          zoom={1.5}
          grainAmount={0.04}
          warpAmplitude={80}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] flex gap-10 items-start justify-center">
        
        {/* SIDEBAR BÊN TRÁI - STICKY BLUE THEME */}
        <div className="hidden xl:flex flex-col w-[310px] space-y-6 flex-shrink-0 sticky top-10 no-print">
          
          {/* Card Trạng thái */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-6 shadow-xl shadow-blue-900/10 border border-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm uppercase">Hồ sơ điện tử</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Mã văn bản:</span>
                <span className="font-mono font-bold text-blue-900">TF-{id}-2026</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${signature ? 'bg-green-100 text-green-700' : isExpired ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {signature ? 'ĐÃ KÝ' : isExpired ? 'HẾT HẠN' : 'CHỜ KÝ'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Ngày khởi tạo:
                </span>
                <span className="font-bold text-gray-800">{today.toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Card Bên A (Hệ thống) */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-6 shadow-xl shadow-blue-900/10 border border-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm uppercase">BÊN A (Hệ thống)</h3>
            </div>
            <p className="text-[11px] text-gray-600 font-medium mb-3">Đã ký xác nhận và đóng mộc điện tử bởi ban quản trị.</p>
            <div className="flex items-center gap-3 p-2 bg-blue-800 rounded-xl">
               <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">A</div>
               <div className="text-[10px]">
                  <p className="font-bold text-white uppercase tracking-tight">TrustFundMe Mgmt</p>
                  <p className="text-blue-200 uppercase tracking-widest text-[8px]">Verified Entity</p>
               </div>
            </div>
          </div>

          {/* Card Bên B (Chủ quỹ) */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-6 shadow-xl shadow-blue-900/10 border border-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm uppercase">BÊN B (Chủ quỹ)</h3>
            </div>
            <div className="space-y-3 text-[11px]">
               <div>
                  <p className="text-gray-400 mb-0.5">Họ và tên (CCCD):</p>
                  <p className="font-bold text-blue-950 uppercase">{kycData?.fullName || ownerInfo?.fullName || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5">Địa chỉ thường trú:</p>
                  <p className="font-bold text-blue-950">{kycData?.address || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5">Nơi làm việc:</p>
                  <p className="font-bold text-blue-950">{kycData?.workplace || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5">Mã số thuế:</p>
                  <p className="font-bold text-blue-950">{kycData?.taxId || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5">Số CCCD/CMND:</p>
                  <p className="font-bold text-blue-950">{kycData?.idNumber || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5">Ngày cấp / Nơi cấp:</p>
                  <p className="font-bold text-blue-950">
                    {kycData?.issueDate ? new Date(kycData.issueDate).toLocaleDateString('vi-VN') : '—'}
                    {' '}/ {kycData?.issuePlace || '—'}
                  </p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5">Điện thoại:</p>
                  <p className="font-bold text-blue-950">{kycData?.phoneNumber || ownerInfo?.phoneNumber || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5">Email:</p>
                  <p className="font-bold text-blue-950 truncate max-w-[200px]">{ownerInfo?.email || '—'}</p>
               </div>
            </div>
          </div>
        </div>

        {/* VÙNG CHÍNH TỜ A4 */}
        <div className="flex flex-col items-center w-full max-w-[840px] flex-shrink-0">
          
          <div className="w-full flex justify-between items-center mb-10 no-print">
            <button onClick={() => router.back()} className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </button>
            {signature && (
              <button 
                onClick={() => handleExportPDF()} 
                className="bg-blue-600 px-8 py-3 rounded-2xl shadow-xl shadow-blue-600/20 text-[10px] font-bold uppercase tracking-[2px] text-white hover:bg-blue-700 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <Printer className="h-4 w-4" /> Export PDF
              </button>
            )}
          </div>

          <div id="legal-document" className="bg-white w-full shadow-[0_40px_100px_rgba(30,58,138,0.1)] p-[80px] min-h-[1100px] flex flex-col font-serif text-slate-950 relative border-t-8 border-blue-900 rounded-sm">
            
            {isExpired && !signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] rotate-[-45deg] z-50">
                 <h1 className="text-[140px] font-black border-[25px] border-rose-600 px-12 text-rose-600 uppercase">HẾT HẠN</h1>
              </div>
            )}

            <div className="text-center space-y-1 mb-12">
              <h2 className="font-bold text-[18px] uppercase tracking-wide">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
              <h3 className="font-bold text-[17px] border-b-2 border-slate-950 inline-block pb-1">Độc lập – Tự do – Hạnh phúc</h3>
            </div>

            <div className="text-right italic text-[14px] mb-12">
              TP. Hồ Chí Minh, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
            </div>

            <div className="text-center mb-16">
              <h1 className="font-bold text-[30px] uppercase tracking-[4px]">BẢN CAM KẾT TRÁCH NHIỆM</h1>
              <div className="w-32 h-[1px] bg-slate-950 mx-auto mt-2"></div>
            </div>

            <div className="mb-10 font-bold text-[16px]">
              Kính gửi: BAN QUẢN TRỊ HỆ THỐNG GÂY QUỸ TỪ THIỆN TRUSTFUNDME
            </div>

            <div className="space-y-5 mb-14 text-[16px]">
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Chiến dịch đăng ký:</span>
                <span className="font-bold uppercase text-[17px] text-blue-900">{campaign?.title || '...........................................'}</span>
              </p>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Tên cá nhân/tổ chức:</span>
                <span className="font-bold uppercase tracking-tight text-blue-900">{kycData?.fullName || ownerInfo?.fullName || '...........................................'}</span>
              </p>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Địa chỉ cư trú/trụ sở:</span>
                <span className="font-bold text-blue-900">{kycData?.address || '...........................................'}</span>
              </p>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Nơi làm việc (nếu có):</span>
                <span className="font-bold text-blue-900">{kycData?.workplace || '...........................................'}</span>
              </p>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Mã số thuế (nếu có):</span>
                <span className="font-bold text-blue-900">{kycData?.taxId || '...........................................'}</span>
              </p>
              <div className="flex gap-12">
                <p className="flex flex-1 border-b border-slate-100 pb-1">
                  <span className="w-40 text-slate-500">Số CCCD/CMND:</span>
                  <span className="font-bold text-blue-900">{kycData?.idNumber || '.............................'}</span>
                </p>
                <p className="flex flex-1 border-b border-slate-100 pb-1">
                  <span className="w-32 text-slate-500">Ngày cấp:</span>
                  <span className="font-bold text-blue-900">{kycData?.issueDate ? new Date(kycData.issueDate).toLocaleDateString('vi-VN') : '.............................'}</span>
                </p>
              </div>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Nơi cấp:</span>
                <span className="font-bold text-blue-900">{kycData?.issuePlace || '...........................................'}</span>
              </p>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Số điện thoại:</span>
                <span className="font-bold text-blue-900">{kycData?.phoneNumber || ownerInfo?.phoneNumber || '...........................................'}</span>
              </p>
            </div>

            <div className="space-y-6 text-justify text-[15.5px] mb-16 leading-relaxed">
              <p className="italic font-bold text-blue-900">Tôi xin cam kết và chịu trách nhiệm hoàn toàn trước Ban quản trị TrustFundMe, các nhà hảo tâm và pháp luật về các nội dung thực hiện chiến dịch như sau:</p>
              
              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 1: Mục đích sử dụng nguồn quỹ quyên góp</h4>
                <p className="pl-4">Tôi cam kết toàn bộ số tiền quyên góp được từ cộng đồng thông qua nền tảng TrustFundMe sẽ chỉ được sử dụng cho các mục tiêu đã đăng ký trong hồ sơ chiến dịch ban đầu. Tuyệt đối không sử dụng quỹ vào các mục đích cá nhân, đầu tư sinh lời, hoặc bất kỳ mục đích nào khác ngoài phạm vi cứu trợ/từ thiện đã công bố.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 2: Nghĩa vụ minh bạch và nộp minh chứng chi tiêu</h4>
                <p className="pl-4">Tôi có trách nhiệm thu thập, lưu trữ và cập nhật toàn bộ hóa đơn, biên lai, danh sách ký nhận hỗ trợ hoặc bất kỳ chứng từ tài chính hợp lệ nào lên hệ thống TrustFundMe trong vòng 48 giờ kể từ khi thực hiện chi quyết. Mọi hình ảnh, tài liệu phải đảm bảo tính rõ nét, không bị tẩy xóa hoặc chỉnh sửa bằng các phần mềm đồ họa.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 3: Cam kết về thời hạn và tiến độ thực hiện</h4>
                <p className="pl-4">Tôi cam kết triển khai chiến dịch đúng theo kế hoạch và lộ trình đã đề ra. Trong trường hợp có sự thay đổi về thời gian hoặc cách thức thực hiện do điều kiện khách quan, tôi phải gửi văn bản giải trình và được sự đồng ý bằng văn bản của Ban quản trị hệ thống trước khi thực hiện thay đổi đó.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 4: Quản lý số dư và hoàn trả nguồn quỹ dư thừa</h4>
                <p className="pl-4">Trường hợp chiến dịch kết thúc nhưng vẫn còn số dư quỹ, tôi cam kết sẽ bàn giao lại toàn bộ số dư cho quỹ chung của TrustFundMe hoặc thực hiện chuyển tiếp cho các chiến dịch ý nghĩa khác theo sự hướng dẫn và điều phối của hệ thống, không tự ý chiếm giữ qua 07 ngày làm việc.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 5: Quyền kiểm tra, giám sát và thanh tra</h4>
                <p className="pl-4">Tôi đồng ý và tạo điều kiện tối đa để Ban quản trị TrustFundMe hoặc cơ quan chức năng có thẩm quyền thực hiện kiểm tra thực tế, thanh tra đột xuất các hoạt động giải ngân và thực địa mà không cần báo trước. Tôi cam kết cung cấp đầy đủ thông tin, sổ sách kế toán khi có yêu cầu.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 6: Cam kết về sự trung thực của thông tin cung cấp</h4>
                <p className="pl-4">Tôi khẳng định mọi thông tin về hoàn cảnh, nhân vật, hình ảnh và câu chuyện được sử dụng để kêu gọi là hoàn toàn đúng sự thật. Nếu có bất kỳ sự gian dối nào nhằm trục lợi từ lòng tin cộng đồng, tôi xin chịu hoàn toàn trách nhiệm về thiệt hại uy tín nền tảng và các bên liên quan.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 7: Quyền hạn của hệ thống đối với vi phạm</h4>
                <p className="pl-4">Tôi chấp nhận rằng TrustFundMe có toàn quyền khóa tài khoản, đóng băng số dư và công khai thông tin cá nhân của tôi trong danh sách "Cảnh báo vi phạm" nếu tôi vi phạm bản cam kết này. Hệ thống không có nghĩa vụ hoàn trả các khoản tiền đã bị đóng băng do vi phạm.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-blue-800">Điều 8: Chế tài xử lý và Truy cứu trách nhiệm hình sự</h4>
                <p className="pl-4 font-bold border-l-4 border-blue-900 ml-2 text-blue-900">Tôi nhận định rõ hành vi lạm dụng tín nhiệm chiếm đoạt tài sản từ thiện có thể bị truy cứu trách nhiệm hình sự theo Điều 174, 175 Bộ luật Hình sự Việt Nam hiện hành.</p>
              </section>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-16 pt-12 border-t border-slate-100">
              <div className="flex flex-col items-center">
                <h3 className="font-bold uppercase text-[15px] mb-1">ĐẠI DIỆN BÊN A</h3>
                <p className="italic text-[12px] mb-4 text-slate-400">(Hệ thống đã xác thực)</p>
                <div className="relative w-36 h-36 flex items-center justify-center">
                   <div className="absolute w-32 h-32 border-2 border-rose-600/50 rounded-full flex items-center justify-center rotate-[-15deg]">
                      <div className="text-rose-600/60 text-[9px] font-bold text-center leading-tight">
                         TRUSTFUNDME <br />
                         VERIFIED <br />
                         OFFICIAL
                      </div>
                   </div>
                   <div className="relative z-10 font-[cursive] text-slate-400 text-3xl rotate-[-10deg] opacity-50">TrustAdmin</div>
                </div>
                <p className="mt-4 font-bold text-rose-600 uppercase text-[10px] tracking-widest">ĐÃ ĐÓNG DẤU</p>
              </div>

              <div className="flex flex-col items-center">
                <h3 className="font-bold uppercase text-[15px] mb-1">ĐẠI DIỆN BÊN B</h3>
                <p className="italic text-[12px] mb-4 text-slate-400">(Ký và ghi rõ họ tên)</p>
                
                {/* VÙNG KÝ TÊN BÊN B - CLICK ĐỂ PHÓNG TO */}
                {!signature || signature === '' ? (
                  <button 
                    onClick={() => !isExpired && setShowSignModal(true)}
                    disabled={isExpired}
                    className={`w-full h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all no-print
                      ${isExpired ? 'bg-rose-50 border-rose-100 text-rose-300' : 'bg-blue-50/50 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400'}`}
                  >
                    {isExpired ? (
                      <AlertCircle className="h-8 w-8" />
                    ) : (
                      <>
                        <div className="p-3 bg-white rounded-full shadow-sm">
                          <Edit3 className="h-6 w-6" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">Nhấp vào đây để ký</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative group w-full h-[180px] flex flex-col items-center justify-center">
                    <img src={signature} alt="Chữ ký" className="max-h-[140px] max-w-full object-contain" />
                    
                    {!isSavedData && (
                      <button 
                        onClick={clearFinalSignature}
                        className="absolute top-0 right-0 p-2 bg-rose-50 text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-all no-print"
                        title="Xóa để ký lại"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    {isSavedData && (
                      <div className="absolute -bottom-6 w-[120%] flex flex-col items-center text-emerald-600 gap-1 font-bold italic pt-4 border-t-2 border-emerald-600">
                         <p>Digital Signature Verified</p>
                         <p className="text-[9px] uppercase tracking-widest">Bản ghi đã được lưu trữ</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-12 font-bold text-[18px] uppercase border-t border-slate-100 w-full text-center pt-4 tracking-tighter text-blue-950">
                  {isSavedData ? (savedFullName || 'N/A') : (kycData?.fullName || ownerInfo?.fullName || '......................')}
                </div>
              </div>
            </div>
          </div>

          {/* NÚT NỘP ĐƠN - CHỈ RA KHI ĐÃ CÓ CHỮ KÝ */}
          {!isExpired && !isSavedData && (
            <div className="w-full mt-12 mb-24 flex justify-center no-print text-center px-4">
              <button 
                onClick={handleSubmit} 
                disabled={submitting || !signature} 
                className={`group flex items-center gap-4 px-16 py-6 rounded-[30px] font-black uppercase tracking-[3px] shadow-2xl transition-all
                  ${!signature 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-700 text-white hover:bg-blue-800 hover:scale-105 active:scale-95 shadow-blue-600/20'}`}
              >
                {submitting ? <Loader2 className="animate-spin h-6 w-6" /> : <FileCheck className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                {signature ? 'XÁC NHẬN & NỘP ĐƠN' : 'VUI LÒNG KÝ TÊN TRƯỚC'}
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR PHẢI - STICKY BLUE THEME */}
        <div className="hidden xl:flex flex-col w-[310px] space-y-6 flex-shrink-0 sticky top-10 no-print">
          {!isSavedData ? (
            <div className={`rounded-[24px] p-8 shadow-xl shadow-blue-900/10 transition-all border border-blue-50 ${isExpired ? 'bg-rose-50 border-rose-100' : 'bg-white/90 backdrop-blur-xl'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${isExpired ? 'bg-rose-100' : 'bg-blue-600'}`}>
                  <Timer className={`h-5 w-5 ${isExpired ? 'text-rose-500' : 'text-white'}`} />
                </div>
                <h3 className={`font-black text-[11px] uppercase tracking-wider ${isExpired ? 'text-rose-700' : 'text-blue-900'}`}>Thời gian còn lại</h3>
              </div>
              <div className={`text-4xl font-mono font-black tracking-tighter text-center py-6 rounded-2xl ${isExpired ? 'text-rose-600 bg-rose-200/20' : 'text-blue-600 bg-blue-50'}`}>
                {timeLeft}
              </div>
              
              <div className="mt-8 space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">
                    <Clock className="h-4 w-4" /> Quy định 48 Giờ
                 </div>
                 <p className="text-[11px] text-blue-900/60 leading-relaxed font-bold">
                  {isExpired 
                    ? '⚠️ Đã quá thời hạn ký kết quy định. Văn bản đã bị khóa và không còn giá trị pháp lý để nộp đơn.'
                    : 'Người dung có tối đa 48 giờ để hoàn tất ký kết điện tử. Sau thời gian này, hệ thống sẽ tự động đóng form.'}
                 </p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-900 rounded-[24px] p-8 shadow-xl border border-blue-800 text-center">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileCheck className="h-8 w-8 text-white" />
               </div>
               <h3 className="font-bold text-white uppercase text-[11px] tracking-widest mb-3">KÝ KẾT THÀNH CÔNG</h3>
               <p className="text-[11px] text-blue-100/60 leading-relaxed">Đã mã hóa và lưu trữ.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PHÓNG TO CHỮ KÝ */}
      {showSignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 no-print">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border-8 border-white animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Vùng ký tên điện tử</h2>
                <p className="text-sm text-slate-500">Vui lòng ký vào khung bên dưới và bấm Hoàn tất</p>
              </div>
              <button 
                onClick={() => setShowSignModal(false)}
                className="p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8">
              <SignaturePad 
                onSave={(dataUrl) => setTempSignature(dataUrl)} 
                width={600} 
                height={300} 
              />
            </div>

            <div className="p-8 bg-slate-50/80 flex justify-end gap-4">
              <button 
                onClick={() => setShowSignModal(false)}
                className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                HỦY BỎ
              </button>
              <button 
                onClick={handleFinalizeSignature}
                disabled={!tempSignature}
                className="flex items-center gap-3 bg-blue-600 text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-30 transition-all"
              >
                <FileCheck className="h-5 w-5" />
                HOÀN TẤT KÝ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÔNG BÁO HOÀN TẤT */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 no-print">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 delay-100 flex flex-col items-center text-center p-10 relative">
            
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50/20 opacity-50 pointer-events-none" />
            
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
              <FileCheck className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">ĐÃ KÝ THÀNH CÔNG</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-10">
              Bản cam kết trách nhiệm điện tử của bạn đã được mã hóa bảo mật và kích hoạt thành công trên hệ thống TrustFundMe e-Contract.
            </p>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/campaign/${id}`);
              }}
              className="w-full bg-[#446b5f] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:bg-[#35534a] hover:scale-105 active:scale-95 transition-all"
            >
              VỀ TRANG CHIẾN DỊCH
            </button>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              ĐÓNG & XEM LẠI BẢN KÝ
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .font-serif { font-family: "Times New Roman", Times, serif; }
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          #legal-document { box-shadow: none !important; padding: 0 !important; margin: 0 !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}