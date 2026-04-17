'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Printer, FileCheck, ShieldCheck, Clock, UserCheck, Building2, AlertCircle, Timer } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import Grainient from '@/components/common/Grainient';
import { toast } from 'react-hot-toast';


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

export default function StaffCommitmentReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<UserInfo | null>(null);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState('');
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

  const handleExportPDF = async () => {
    // Dynamic import to avoid "self is not defined" SSR error
    const html2pdf = (await import('html2pdf.js' as any)).default;

    const element = document.getElementById('legal-document');
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `bien-ban-cam-ket-TF-${id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const loadingToast = toast.loading('Đang khởi tạo bản PDF...');
    html2pdf().from(element).set(opt).save().then(() => {
      toast.success('Đã tải bản PDF thành công!', { id: loadingToast });
    }).catch(() => {
      toast.error('Lỗi khi xuất PDF', { id: loadingToast });
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );

  const today = new Date();

  return (
    <div className="h-screen relative flex justify-center py-12 px-6 bg-slate-50 overflow-y-auto custom-scrollbar">
      
      <div className="fixed inset-0 z-0 opacity-40">
        <Grainient
          color1="#ffffff" color2="#f8fafc" color3="#e2e8f0" 
          timeSpeed={0.8} warpSpeed={2.5} zoom={1.5} grainAmount={0.04} warpAmplitude={80}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] flex gap-10 items-start justify-center pb-20">
        
        {/* SIDEBAR BÊN TRÁI - STICKY BLUE THEME (SYNCED WITH USER) */}
        <div className="hidden xl:flex flex-col w-[310px] space-y-6 flex-shrink-0 sticky top-0 no-print">
          
          <div className="bg-[#1e3a8a] rounded-[24px] p-6 shadow-xl text-white">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-bold text-xs uppercase tracking-widest">Chế độ Kiểm duyệt</h3>
             </div>
             <p className="text-[10px] font-medium opacity-80 uppercase tracking-tight leading-relaxed">Staff có quyền xem và xuất PDF biên bản này nhưng không được phép thương lượng hoặc ký thay.</p>
          </div>

          {/* Card Trạng thái */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-6 shadow-xl shadow-blue-900/10 border border-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm uppercase">Hồ sơ điện tử</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-bold uppercase">Mã văn bản:</span>
                <span className="font-mono font-bold text-blue-900">TF-{id}-2026</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-bold uppercase">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${signature ? 'bg-emerald-100 text-emerald-700' : isExpired ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                  {signature ? 'ĐÃ KÝ' : isExpired ? 'HẾT HẠN' : 'CHỜ KÝ'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-bold uppercase">Ngày khởi tạo:</span>
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
                  <p className="font-bold text-white uppercase tracking-tight">Ban Quản Trị TrustFundMe</p>
                  <p className="text-blue-200 uppercase tracking-widest text-[8px]">Đơn Vị Đã Xác Thực</p>
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
                  <p className="text-gray-400 mb-0.5 font-bold uppercase text-[9px]">Họ và tên (CCCD):</p>
                  <p className="font-bold text-blue-950 uppercase">{kycData?.fullName || ownerInfo?.fullName || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5 font-bold uppercase text-[9px]">Số CCCD/CMND:</p>
                  <p className="font-bold text-blue-950">{kycData?.idNumber || '—'}</p>
               </div>
               <div>
                  <p className="text-gray-400 mb-0.5 font-bold uppercase text-[9px]">Điện thoại:</p>
                  <p className="font-bold text-blue-950">{kycData?.phoneNumber || ownerInfo?.phoneNumber || '—'}</p>
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
            <button 
              onClick={() => handleExportPDF()} 
              className="bg-[#1e3a8a] px-8 py-3 rounded-2xl shadow-xl shadow-blue-900/20 text-[10px] font-bold uppercase tracking-[2px] text-white hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              <Printer className="h-4 w-4" /> Xuất bản PDF
            </button>
          </div>

          <div id="legal-document" className="bg-white w-full shadow-[0_40px_100px_rgba(30,58,138,0.1)] p-[80px] min-h-[1100px] flex flex-col font-serif text-slate-950 relative border-t-8 border-blue-900 rounded-sm">
            
            {(isExpired && !signature) && (
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
                <span className="font-bold uppercase text-[17px] text-blue-900">{campaign?.title || '—'}</span>
              </p>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Tên cá nhân/tổ chức:</span>
                <span className="font-bold uppercase tracking-tight text-blue-900">{kycData?.fullName || ownerInfo?.fullName || '—'}</span>
              </p>
              <p className="flex border-b border-slate-100 pb-1">
                <span className="w-52 shrink-0 text-slate-500">Địa chỉ cư trú:</span>
                <span className="font-bold text-blue-900">{kycData?.address || '—'}</span>
              </p>
              <div className="flex gap-12">
                <p className="flex flex-1 border-b border-slate-100 pb-1">
                  <span className="w-40 text-slate-500">Số CCCD/CMND:</span>
                  <span className="font-bold text-blue-900">{kycData?.idNumber || '—'}</span>
                </p>
                <p className="flex flex-1 border-b border-slate-100 pb-1">
                  <span className="w-32 text-slate-500">Ngày cấp:</span>
                  <span className="font-bold text-blue-900">{kycData?.issueDate ? new Date(kycData.issueDate).toLocaleDateString('vi-VN') : '—'}</span>
                </p>
              </div>
            </div>

            <div className="space-y-6 text-justify text-[15.5px] mb-16 leading-relaxed">
              <p className="italic font-bold text-blue-900">Tôi xin cam kết và chịu trách nhiệm hoàn toàn trước Ban quản trị TrustFundMe, các nhà hảo tâm và pháp luật về các nội dung thực hiện chiến dịch như sau:</p>
              
              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 1: Mục đích sử dụng nguồn quỹ quyên góp</h4>
                <p className="pl-4">Tôi cam kết toàn bộ số tiền quyên góp được từ cộng đồng thông qua nền tảng TrustFundMe sẽ chỉ được sử dụng cho các mục tiêu đã đăng ký trong hồ sơ chiến dịch ban đầu. Tuyệt đối không sử dụng quỹ vào các mục đích cá nhân, đầu tư sinh lời, hoặc bất kỳ mục đích nào khác ngoài phạm vi cứu trợ/từ thiện đã công bố.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 2: Nghĩa vụ minh bạch và nộp minh chứng chi tiêu</h4>
                <p className="pl-4">Tôi có trách nhiệm thu thập, lưu trữ và cập nhật toàn bộ hóa đơn, biên lai, danh sách ký nhận hỗ trợ hoặc bất kỳ chứng từ tài chính hợp lệ nào lên hệ thống TrustFundMe trong vòng 48 giờ kể từ khi thực hiện chi quyết. Mọi hình ảnh, tài liệu phải đảm bảo tính rõ nét, không bị tẩy xóa hoặc chỉnh sửa bằng các phần mềm đồ họa.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 3: Cam kết về thời hạn và tiến độ thực hiện</h4>
                <p className="pl-4">Tôi cam kết triển khai chiến dịch đúng theo kế hoạch và lộ trình đã đề ra. Trong trường hợp có sự thay đổi về thời gian hoặc cách thức thực hiện do điều kiện khách quan, tôi phải gửi văn bản giải trình và được sự đồng ý bằng văn bản của Ban quản trị hệ thống trước khi thực hiện thay đổi đó.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 4: Quản lý số dư và hoàn trả nguồn quỹ dư thừa</h4>
                <p className="pl-4">Trường hợp chiến dịch kết thúc nhưng vẫn còn số dư quỹ, tôi cam kết sẽ bàn giao lại toàn bộ số dư cho quỹ chung của TrustFundMe hoặc thực hiện chuyển tiếp cho các chiến dịch ý nghĩa khác theo sự hướng dẫn và điều phối của hệ thống, không tự ý chiếm giữ qua 07 ngày làm việc.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 5: Quyền kiểm tra, giám sát và thanh tra</h4>
                <p className="pl-4">Tôi đồng ý và tạo điều kiện tối đa để Ban quản trị TrustFundMe hoặc cơ quan chức năng có thẩm quyền thực hiện kiểm tra thực tế, thanh tra đột xuất các hoạt động giải ngân và thực địa mà không cần báo trước. Tôi cam kết cung cấp đầy đủ thông tin, sổ sách kế toán khi có yêu cầu.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 6: Cam kết về sự trung thực của thông tin cung cấp</h4>
                <p className="pl-4">Tôi khẳng định mọi thông tin về hoàn cảnh, nhân vật, hình ảnh và câu chuyện được sử dụng để kêu gọi là hoàn toàn đúng sự thật. Nếu có bất kỳ sự gian dối nào nhằm trục lợi từ lòng tin cộng đồng, tôi xin chịu hoàn toàn trách nhiệm về thiệt hại uy tín nền tảng và các bên liên quan.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 7: Quyền hạn của hệ thống đối với vi phạm</h4>
                <p className="pl-4">Tôi chấp nhận rằng TrustFundMe có toàn quyền khóa tài khoản, đóng băng số dư và công khai thông tin cá nhân của tôi trong danh sách "Cảnh báo vi phạm" nếu tôi vi phạm bản cam kết này. Hệ thống không có nghĩa vụ hoàn trả các khoản tiền đã bị đóng băng do vi phạm.</p>
              </section>

              <section>
                <h4 className="font-bold uppercase text-[14px] mb-1.5 underline text-[#1e3a8a]">Điều 8: Chế tài xử lý và Truy cứu trách nhiệm hình sự</h4>
                <p className="pl-4 font-bold border-l-4 border-blue-900 ml-2 text-blue-900 leading-relaxed">Tôi nhận định rõ hành vi lạm dụng tín nhiệm chiếm đoạt tài sản từ thiện có thể bị truy cứu trách nhiệm hình sự theo Điều 174, 175 Bộ luật Hình sự Việt Nam hiện hành.</p>
              </section>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-16 pt-12 border-t border-slate-100">
               <div className="flex flex-col items-center">
                  <h3 className="font-bold uppercase text-[15px] mb-1">ĐẠI DIỆN BÊN A</h3>
                  <p className="italic text-[12px] mb-4 text-slate-400">(Hệ thống đã xác thực)</p>
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute w-32 h-32 border-2 border-rose-600/50 rounded-full flex items-center justify-center rotate-[-15deg]">
                        <div className="text-rose-600/60 text-[9px] font-bold text-center leading-tight uppercase">
                            TRUSTFUNDME <br /> XÁC THỰC CHÍNH THỨC
                        </div>
                    </div>
                    <div className="relative z-10 font-[cursive] text-slate-400 text-3xl rotate-[-10deg] opacity-50">TrustAdmin</div>
                  </div>
                  <p className="mt-4 font-bold text-rose-600 uppercase text-[10px] tracking-widest">ĐÃ ĐÓNG DẤU</p>
               </div>

               <div className="flex flex-col items-center text-center">
                  <h3 className="font-bold uppercase text-[15px] mb-1">ĐẠI DIỆN BÊN B</h3>
                  <p className="italic text-[12px] mb-4 text-slate-400">(Đã ký xác nhận điện tử)</p>
                  
                  <div className="w-full h-[180px] flex items-center justify-center bg-blue-50/30 rounded-2xl border border-blue-100/50 relative">
                    {signature ? (
                      <div className="flex flex-col items-center gap-3">
                        <img src={signature} alt="Chữ ký" className="max-h-[120px] object-contain" />
                        <div className="flex flex-col items-center text-emerald-600 gap-0.5 font-bold italic border-t border-emerald-200 pt-2 px-4">
                           <span className="text-[10px]">Chữ Ký Số Đã Xác Minh</span>
                           <span className="text-[8px] uppercase tracking-widest opacity-60">Chữ Ký Điện Tử Đã Xác Thực</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                         <Clock className="h-6 w-6 opacity-30" />
                         <span className="text-[10px] font-black uppercase tracking-widest italic">Chưa thực hiện ký kết</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 font-bold text-[20px] uppercase border-t border-slate-100 w-full text-center pt-4 tracking-tighter text-blue-950">
                    {isSavedData ? (savedFullName || '—') : (kycData?.fullName || ownerInfo?.fullName || '—')}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR PHẢI (SYNCED) */}
        <div className="hidden xl:flex flex-col w-[310px] space-y-6 flex-shrink-0 sticky top-0 no-print">
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-8 shadow-xl shadow-blue-900/10 border border-blue-50">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Timer className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-blue-900">Thời hạn ký kết</h3>
             </div>
             <div className={`text-4xl font-mono font-black text-center py-6 rounded-2xl ${isExpired ? 'text-rose-600 bg-rose-50' : 'text-blue-600 bg-blue-50'}`}>
                {signature ? 'HOÀN TẤT' : timeLeft}
             </div>
             <p className="mt-6 text-[11px] text-blue-900/60 leading-relaxed font-bold italic">
               {signature ? 'Bản cam kết đã có hiệu lực pháp lý và được mã hóa lưu trữ trên TrustFundMe e-Contract.' : 'Văn bản đang trong thời gian chờ chủ quỹ hoàn tất thủ tục ký điện tử.'}
             </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .font-serif { font-family: "Times New Roman", Times, serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media print {
          .no-print { display: none !important; }
          #legal-document { box-shadow: none !important; padding: 0 !important; margin: 0 !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
