'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, ScrollText, Landmark, Loader2, CheckCircle2, 
  FileDown, Upload, Trash2, Eye, Fingerprint, Star, Lock, AlertCircle, Download
} from 'lucide-react';
import KYCInputForm from '@/components/staff/request/KYCInputForm';
import { bankAccountService } from '@/services/bankAccountService';
import { BankAccountDto } from '@/types/bankAccount';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContextProxy';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { kycService } from '@/services/kycService';

interface UnifiedVerificationModalProps {
  userId: string | number;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
  kycData: any;
  bankAccount: BankAccountDto | null;
  cvUrl: string;
}

export default function UnifiedVerificationModal({
  userId,
  userName,
  onClose,
  onSuccess,
  kycData,
  bankAccount: initialBankAccount,
  cvUrl: initialCvUrl
}: UnifiedVerificationModalProps) {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'kyc' | 'cv' | 'bank'>('kyc');
  const [cvUploading, setCvUploading] = useState(false);
  const [currentCvUrl, setCurrentCvUrl] = useState(initialCvUrl);
  const [isDragging, setIsDragging] = useState(false);
  
  // Multi-step state
  const [kycFormData, setKycFormData] = useState<any>(null);
  const kycFormDataRef = React.useRef<any>(null);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  // Bank state
  const [bankAccount, setBankAccount] = useState<BankAccountDto | null>(initialBankAccount);
  const [bankCode, setBankCode] = useState(initialBankAccount?.bankCode || '');
  const [accountNumber, setAccountNumber] = useState(initialBankAccount?.accountNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(initialBankAccount?.accountHolderName || '');
  const [webhookKey, setWebhookKey] = useState(initialBankAccount?.webhookKey || '');
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { 
      window.removeEventListener('keydown', h); 
      document.body.style.overflow = ''; 
    };
  }, [onClose]);

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trBankCode = bankCode.trim();
    const trAccNum = accountNumber.trim();
    const trAccName = accountHolderName.trim();

    if (!trBankCode) { toast('Vui lòng nhập mã ngân hàng', 'error'); return; }
    if (!trAccNum) { toast('Vui lòng nhập số tài khoản', 'error'); return; }
    if (!trAccName) { toast('Vui lòng nhập tên chủ tài khoản', 'error'); return; }

    setSavingBank(true);
    try {
      const bankPayload = {
        bankCode: trBankCode,
        accountNumber: trAccNum,
        accountHolderName: trAccName.toUpperCase(),
        webhookKey: webhookKey.trim() || undefined
      };

      if (bankAccount) {
        const updatedBank = await bankAccountService.update(bankAccount.id, bankPayload);
        setBankAccount(updatedBank);
      } else {
        const newBank = await bankAccountService.create(bankPayload);
        setBankAccount(newBank);
      }
      toast('Cập nhật thông tin ngân hàng thành công', 'success');
      onSuccess();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi khi lưu thông tin ngân hàng', 'error');
    } finally {
      setSavingBank(false);
    }
  };

  const uploadCv = async (file: File) => {
    setCvUploading(true);
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const removeAccents = (str: string) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9\s_-]/g, '');
      };
      const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const safeFullName = removeAccents(userName || 'User').replace(/\s+/g, '_');
      const fileName = `${safeFullName}_${dateStr}.${file.name.split('.').pop()}`;
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'TrustFundMe';
      
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(`cvs/${fileName}`, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(`cvs/${fileName}`);
      
      await api.put(API_ENDPOINTS.USERS.BY_ID(userId), { cvUrl: publicUrl });
      updateUser({ cvUrl: publicUrl });
      setCurrentCvUrl(publicUrl);
      toast('Tải lên hồ sơ năng lực thành công!', 'success');
      onSuccess();
    } catch (error: any) {
      toast('Lỗi tải lên CV: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setCvUploading(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadCv(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const isAllowed = ['.pdf', '.doc', '.docx'].some(ext => file.name.toLowerCase().endsWith(ext));
      if (!isAllowed) {
        toast('Định dạng file không hỗ trợ', 'error');
        return;
      }
      await uploadCv(file);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmittingAll(true);
    try {
      // 1. Submit Bank (since it's the current tab's focus, but we do it all)
      const bankPayload = {
        bankCode: bankCode.trim(),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim().toUpperCase(),
        webhookKey: webhookKey.trim() || undefined
      };

      if (bankAccount) {
        await bankAccountService.update(bankAccount.id, bankPayload);
      } else {
        await bankAccountService.create(bankPayload);
      }

      // 2. Submit KYC if data changed
      if (kycFormData && kycData?.status !== 'APPROVED') {
        const kycPayload = {
          ...kycFormData,
          issueDate: kycFormData.issueDate ? kycFormData.issueDate.toISOString().split('T')[0] : '',
          expiryDate: kycFormData.expiryDate ? kycFormData.expiryDate.toISOString().split('T')[0] : '',
        };
        await kycService.submit(userId, kycPayload);
      }

      toast('Đã gửi toàn bộ hồ sơ xác thực thành công!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Có lỗi xảy ra khi gửi hồ sơ', 'error');
    } finally {
      setIsSubmittingAll(false);
    }
  };

  // ── Step completion checks ──
  const isKycComplete = () => {
    // 1. KYC already submitted and has a status → complete
    if (kycData?.status === 'APPROVED' || kycData?.status === 'PENDING') return true;

    // 2. KYC data exists from server (any status) with required fields filled
    if (kycData && kycData.fullName && kycData.idNumber && kycData.issueDate && kycData.expiryDate && kycData.issuePlace) {
      return true;
    }

    // 3. User has filled required fields in the form - use REF for synchronous read
    const d = kycFormDataRef.current;
    if (d) {
      const ok = !!(
        d.fullName?.trim() &&
        d.idNumber?.trim() &&
        d.issueDate &&
        d.expiryDate &&
        d.issuePlace?.trim()
      );
      if (ok) return true;
    }

    // 4. Fallback: read DOM input values directly (handles React async state timing)
    try {
      const getVal = (name: string) => {
        const el = document.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
        return el?.value?.trim() || '';
      };
      const fullName = getVal('fullName');
      const idNumber = getVal('idNumber');
      const issuePlace = getVal('issuePlace');
      // DatePicker inputs don't have name attr, check by placeholder
      const dateInputs = document.querySelectorAll('input[placeholder="DD/MM/YYYY"]');
      const hasIssueDateVal = dateInputs.length >= 1 && (dateInputs[0] as HTMLInputElement)?.value?.trim();
      const hasExpiryDateVal = dateInputs.length >= 2 && (dateInputs[1] as HTMLInputElement)?.value?.trim();

      if (fullName && idNumber && issuePlace && hasIssueDateVal && hasExpiryDateVal) {
        return true;
      }
    } catch (e) {
      // DOM query failed, ignore
    }

    return false;
  };

  const isCvComplete = () => {
    return !!currentCvUrl;
  };

  const canAccessTab = (tabId: string): boolean => {
    if (tabId === 'kyc') return true;
    if (tabId === 'cv') return isKycComplete();
    if (tabId === 'bank') return isKycComplete() && isCvComplete();
    return false;
  };

  const getStepBlockMessage = (tabId: string): string => {
    if (tabId === 'cv' && !isKycComplete()) {
      return 'Vui lòng hoàn thành bước Định danh (KYC) trước khi tiếp tục';
    }
    if (tabId === 'bank') {
      if (!isKycComplete()) return 'Vui lòng hoàn thành bước Định danh (KYC) trước';
      if (!isCvComplete()) return 'Vui lòng tải lên Hồ sơ năng lực (CV) trước khi tiếp tục';
    }
    return '';
  };

  const handleTabClick = (tabId: 'kyc' | 'cv' | 'bank') => {
    if (!canAccessTab(tabId)) {
      toast(getStepBlockMessage(tabId), 'error');
      return;
    }
    setActiveTab(tabId);
  };

  const nextStep = () => {
    if (activeTab === 'kyc') {
      if (!isKycComplete()) {
        toast('Vui lòng điền đầy đủ thông tin KYC (họ tên, số CCCD, ngày cấp, ngày hết hạn, nơi cấp) trước khi tiếp tục', 'error');
        return;
      }
      setActiveTab('cv');
    } else if (activeTab === 'cv') {
      if (!isCvComplete()) {
        toast('Vui lòng tải lên hồ sơ năng lực (CV) trước khi tiếp tục', 'error');
        return;
      }
      setActiveTab('bank');
    }
  };

  const prevStep = () => {
    if (activeTab === 'bank') setActiveTab('cv');
    else if (activeTab === 'cv') setActiveTab('kyc');
  };

  const handleKycDataChange = React.useCallback((data: any) => {
    kycFormDataRef.current = data;
    setKycFormData(data);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl flex flex-col h-fit max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Section - More Compact */}
        <div className="px-8 py-4 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Xác thực hồ sơ</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Trust & Transparency Identity Center</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Compact Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
              {[
                { id: 'kyc', label: 'Định danh', icon: Shield, status: kycData?.status === 'APPROVED' || kycData?.status === 'PENDING' },
                { id: 'cv', label: 'Hồ sơ năng lực', icon: ScrollText, status: !!currentCvUrl },
                { id: 'bank', label: 'Ngân hàng', icon: Landmark, status: !!bankAccount }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const accessible = canAccessTab(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id as any)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300
                      ${isActive ? 'bg-white text-black shadow-sm' : accessible ? 'text-gray-400 hover:text-black' : 'text-gray-300 cursor-not-allowed'}
                    `}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-black' : 'text-current'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.status && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
                  </button>
                );
              })}
            </div>

            <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-black hover:text-white transition-all duration-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="overflow-y-auto px-8 pt-1 pb-4 custom-scrollbar bg-white">
          {activeTab === 'kyc' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Bước 1: Xác minh danh tính</h3>
                  {kycData?.status && (
                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      kycData.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      kycData.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                      'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {kycData.status === 'APPROVED' ? 'Đã phê duyệt' : 
                       kycData.status === 'PENDING' ? 'Đang chờ duyệt' : 'Bị từ chối'}
                    </div>
                  )}
                </div>
              </div>
              <KYCInputForm
                userId={userId}
                userName={userName}
                onSuccess={() => {}}
                isStaff={false}
                readOnly={kycData?.status === 'APPROVED'}
                onDataChange={handleKycDataChange}
                hideSubmitButton={true}
                initialData={kycFormData}
              />
              
              <div className="flex justify-end">
                <button 
                  onClick={nextStep}
                  className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                >
                  Bước tiếp theo <Shield className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
              <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-4 space-y-6">
                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                    <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                      <ScrollText className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Hồ sơ năng lực</h3>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                      Chứng minh khả năng thực hiện dự án bằng cách tải lên CV hoặc các tài liệu liên quan.
                    </p>
                    
                    <a 
                      href="/templates/Mau_CV_Thien_Nguyen.docx" 
                      download
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Tải mẫu hồ sơ (.docx)
                    </a>
                  </div>
                </div>

                <div className="col-span-8">
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`bg-gray-50/50 rounded-3xl p-8 border-2 border-dashed transition-all flex flex-col items-center justify-center min-h-[300px] ${
                      isDragging ? 'border-black bg-gray-100 scale-[0.99]' : 'border-gray-200'
                    }`}
                  >
                    {currentCvUrl ? (
                      <div className="w-full space-y-6">
                        <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                              <p className="text-base font-black text-gray-900">Hồ sơ đã sẵn sàng</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document uploaded and verified</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <a href={currentCvUrl} target="_blank" rel="noopener noreferrer" 
                               className="h-12 w-12 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all">
                              <Eye className="h-6 w-6" />
                            </a>
                            <label className="cursor-pointer">
                              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCvUpload} disabled={cvUploading} />
                              <div className="h-12 px-6 flex items-center gap-2 rounded-xl bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg">
                                {cvUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Thay đổi
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <label className="cursor-pointer group block">
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCvUpload} disabled={cvUploading} />
                          <div className="h-20 w-20 rounded-[2rem] bg-black text-white flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                            {cvUploading ? <Loader2 className="h-10 w-10 animate-spin" /> : <Upload className="h-10 w-10" />}
                          </div>
                          <p className="text-lg font-black text-gray-900 uppercase tracking-tight">Kéo thả hoặc Nhấn để tải lên CV</p>
                          <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Hỗ trợ PDF, DOCX (Tối đa 10MB)</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-50">
                <button 
                  onClick={prevStep}
                  className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
                >
                  Quay lại bước 1
                </button>
                <button 
                  onClick={nextStep}
                  className="px-10 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-3 shadow-xl"
                >
                  Bước tiếp theo: Ngân hàng <Landmark className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Sidebar Info */}
                <div className="col-span-4 space-y-3">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white mb-3 shadow-md">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-tight mb-1.5">Tài khoản nhận tiền</h3>
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                      Thông tin này được dùng để tiếp nhận các khoản quyên góp công khai.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                        <Star className="h-2.5 w-2.5 fill-white" />
                      </div>
                      <h4 className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Nghị định 93/2021/NĐ-CP</h4>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 leading-relaxed">
                      "Cá nhân phải mở tài khoản riêng tại ngân hàng cho từng cuộc vận động."
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[8px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                        ĐỐI SOÁT CASSO
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5">Tự động đồng bộ giao dịch thời gian thực.</p>
                    </div>
                  </div>
                </div>

                {/* Bank Form */}
                <div className="col-span-8 bg-gray-50/30 rounded-3xl p-4 border border-gray-100">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Mã ngân hàng (VietinBank, VCB...)</label>
                      <input 
                        type="text" placeholder="VD: VCB" value={bankCode} onChange={e => setBankCode(e.target.value)} required
                        className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Số tài khoản</label>
                      <input 
                        type="text" placeholder="Nhập số tài khoản" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required
                        className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none font-mono tracking-widest" 
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên chủ tài khoản (Không dấu)</label>
                      <input 
                        type="text" placeholder="VD: NGUYEN VAN A" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} required
                        className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none uppercase" 
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Webhook Key (Casso - Tùy chọn)</label>
                      <input 
                        type="text" placeholder="Mã bảo mật từ hệ thống Casso" value={webhookKey} onChange={e => setWebhookKey(e.target.value)}
                        className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-50">
                <button 
                  onClick={prevStep}
                  className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
                >
                  Quay lại bước 2
                </button>
                <button 
                  onClick={handleFinalSubmit}
                  disabled={isSubmittingAll} 
                  className="px-8 py-4 bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmittingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Hoàn tất xác thực
                </button>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
