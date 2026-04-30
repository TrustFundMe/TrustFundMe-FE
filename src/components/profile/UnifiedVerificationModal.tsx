'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, ScrollText, Loader2, CheckCircle2, FileDown, Upload, Trash2, Eye, Fingerprint, Star, Lock, AlertCircle, Download, Clock, XCircle } from 'lucide-react';
import KYCInputForm from '@/components/staff/request/KYCInputForm';
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
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { 
      window.removeEventListener('keydown', h); 
      document.body.style.overflow = ''; 
    };
  }, [onClose]);

  const [cvUploading, setCvUploading] = useState(false);
  const [currentCvUrl, setCurrentCvUrl] = useState(initialCvUrl);
  const [cvMetadata, setCvMetadata] = useState<{ name: string, time: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [kycFormData, setKycFormData] = useState<any>(null);
  const kycFormDataRef = React.useRef<any>(null);

  const uploadCv = async (file: File) => {
    setCvUploading(true);
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const removeAccents = (str: string) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9\s_-]/g, '');
      };
      const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const timestamp = Date.now();
      const safeFullName = removeAccents(userName || 'User').replace(/\s+/g, '_');
      const fileName = `${safeFullName}_${dateStr}_${timestamp}.${file.name.split('.').pop()}`;
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'TrustFundMe';
      
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(`cvs/${fileName}`, file, {
        upsert: true
      });
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(`cvs/${fileName}`);
      
      // Note: We no longer persist to DB immediately. Persisting happens on final submit.
      updateUser({ cvUrl: publicUrl });
      setCurrentCvUrl(publicUrl);
      setCvMetadata({
        name: file.name,
        time: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
      });
      toast('Đã chọn hồ sơ năng lực!', 'success');
    } catch (error: any) {
      console.error('CV Upload Error:', error);
      if (error.response?.status === 401) {
        toast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại để tải lên hồ sơ.', 'error');
      } else {
        toast('Lỗi tải lên CV: ' + (error.response?.data?.message || error.message || 'Unknown error'), 'error');
      }
    } finally {
      setCvUploading(false);
    }
  };

  const deleteCv = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ năng lực này?')) return;
    setCvUploading(true);
    try {
      await api.put(API_ENDPOINTS.USERS.BY_ID(userId), { cvUrl: '' });
      updateUser({ cvUrl: '' });
      setCurrentCvUrl('');
      toast('Đã xóa hồ sơ năng lực!', 'success');
    } catch (error: any) {
      console.error('CV Delete Error:', error);
      if (error.response?.status === 401) {
        toast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại để xóa hồ sơ.', 'error');
      } else {
        toast('Lỗi xóa CV: ' + (error.response?.data?.message || error.message || 'Unknown error'), 'error');
      }
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
    // 1. Validation for KYC
    if (kycData?.status !== 'APPROVED') {
      const kycStatus = isKycComplete();
      if (!kycStatus.ok) {
        toast(`Vui lòng điền đủ: ${kycStatus.missing.join(', ')}`, 'error');
        return;
      }
    }

    // 2. Validation for CV
    if (!isCvComplete()) {
      toast('Vui lòng tải lên hồ sơ năng lực (CV) trước khi hoàn tất', 'error');
      return;
    }

    setIsSubmittingAll(true);
    try {
      // Submit/Update KYC if data exists and not already approved
      if (kycFormData && kycData?.status !== 'APPROVED') {
        const kycPayload = {
          ...kycFormData,
          issueDate: kycFormData.issueDate ? (kycFormData.issueDate instanceof Date ? kycFormData.issueDate.toISOString().split('T')[0] : kycFormData.issueDate) : '',
          expiryDate: kycFormData.expiryDate ? (kycFormData.expiryDate instanceof Date ? kycFormData.expiryDate.toISOString().split('T')[0] : kycFormData.expiryDate) : '',
          // Face biometric data (from FaceLivenessCheck via KYCInputForm onDataChange)
          faceDescriptor: kycFormData.faceDescriptor ? JSON.stringify(kycFormData.faceDescriptor) : null,
          livenessMetadata: kycFormData.livenessMetadata ? JSON.stringify(kycFormData.livenessMetadata) : null,
          faceMeshSample: kycFormData.faceMeshSample ? JSON.stringify(kycFormData.faceMeshSample) : null,
        };
        
        if (kycData && kycData.id) {
          await kycService.update(userId, kycPayload);
        } else {
          await kycService.submit(userId, kycPayload);
        }
      }

      // 4. Persist CV URL to user table (Final step)
      if (currentCvUrl) {
        await api.put(API_ENDPOINTS.USERS.BY_ID(userId), { cvUrl: currentCvUrl });
        updateUser({ cvUrl: currentCvUrl });
      }

      toast('Đã nộp hồ sơ xác thực thành công!', 'success');
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
      return { ok: true };
    }

    // 3. User has filled required fields in the form - use REF for synchronous read
    const d = kycFormDataRef.current;
    if (d) {
      const missing = [];
      if (!d.fullName?.trim()) missing.push('Họ tên');
      if (!d.idNumber?.trim()) missing.push('Số định danh');
      if (!d.issueDate) missing.push('Ngày cấp');
      if (!d.expiryDate) missing.push('Ngày hết hạn');
      if (!d.issuePlace?.trim()) missing.push('Nơi cấp');
      if (!d.address?.trim()) missing.push('Địa chỉ cư trú');
      if (!d.idImageFront) missing.push('Ảnh mặt trước/Hộ chiếu');
      if (d.idType !== 'PASSPORT' && !d.idImageBack) missing.push('Ảnh mặt sau');
      if (!d.selfieImage) missing.push('Ảnh xác thực gương mặt');
      
      if (missing.length > 0) {
        return { ok: false, missing };
      }
      return { ok: true };
    }

    // Fallback: try reading from DOM if ref is not yet populated
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

      const missing = [];
      if (!fullName) missing.push('Họ tên');
      if (!idNumber) missing.push('Số định danh');
      if (!issuePlace) missing.push('Nơi cấp');
      if (!hasIssueDateVal) missing.push('Ngày cấp');
      if (!hasExpiryDateVal) missing.push('Ngày hết hạn');

      if (missing.length > 0) {
        return { ok: false, missing };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, missing: ['Thông tin KYC'] };
    }
  };

  const isCvComplete = () => {
    if (kycData?.status === 'APPROVED' || currentCvUrl) return true;
    return false;
  };

  const handleKycDataChange = React.useCallback((data: any) => {
    kycFormDataRef.current = data;
    setKycFormData(data);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl flex flex-col h-fit max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Section - Ultra Compact */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-white shadow-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Xác thực hồ sơ</h2>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">Trust & Transparency Identity Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
               <CheckCircle2 className="h-3 w-3 text-emerald-500" />
               <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Hồ sơ đa tầng</span>
            </div>

            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-black hover:text-white transition-all duration-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Section - Merged View */}
        <div className="overflow-y-auto px-6 py-4 custom-scrollbar bg-white">
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* LEFT: KYC Form */}
            <div className="col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Phần 1: Thông tin định danh cá nhân</h3>
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
              
              <div className="bg-gray-50/30 rounded-3xl p-1 border border-gray-100">
                <KYCInputForm
                  userId={userId}
                  userName={userName}
                  onSuccess={() => {}}
                  isStaff={false}
                  readOnly={kycData?.status === 'APPROVED' || kycData?.status === 'PENDING'}
                  onDataChange={handleKycDataChange}
                  hideSubmitButton={true}
                  initialData={kycFormData}
                />
              </div>

            </div>

            {/* RIGHT: CV Upload & Instructions */}
            <div className="col-span-5 flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white">
                    <ScrollText className="h-4 w-4" />
                  </div>
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Phần 2: Hồ sơ năng lực</h3>
                </div>

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`bg-gray-50/50 rounded-2xl p-4 border-2 border-dashed transition-all flex flex-col items-center justify-center min-h-[140px] ${
                    isDragging ? 'border-black bg-gray-100 scale-[0.99]' : 'border-gray-200'
                  }`}
                >
                  {currentCvUrl ? (
                    <div className="w-full space-y-4 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Hồ sơ đã tải lên</p>
                        {cvMetadata ? (
                          <div className="bg-white/50 border border-gray-100 rounded-xl p-2 max-w-[240px] mx-auto">
                            <p className="text-[9px] font-bold text-gray-600 truncate" title={cvMetadata.name}>{cvMetadata.name}</p>
                            <p className="text-[8px] font-medium text-gray-400">Tải lên lúc: {cvMetadata.time}</p>
                          </div>
                        ) : (
                           <p className="text-[9px] font-medium text-gray-400 italic">Tài liệu đã được ghi nhận</p>
                        )}
                      </div>
                        <div className="flex items-center justify-center gap-2">
                          <a href={currentCvUrl} target="_blank" rel="noopener noreferrer" 
                             className="h-10 px-4 flex items-center gap-2 rounded-xl bg-white border border-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
                            <Eye className="h-3.5 w-3.5" /> Xem
                          </a>
                          {kycData?.status !== 'PENDING' && kycData?.status !== 'APPROVED' && (
                            <>
                              <label className="cursor-pointer">
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCvUpload} disabled={cvUploading} />
                                <div className="h-10 px-4 flex items-center gap-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                                  {cvUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                  Đổi
                                </div>
                              </label>
                              <button 
                                type="button" 
                                onClick={deleteCv}
                                disabled={cvUploading}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                                title="Xóa hồ sơ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <label className="cursor-pointer group block">
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCvUpload} disabled={cvUploading} />
                        <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                          {cvUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                        </div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-tight">Kéo thả hoặc Nhấn để tải CV</p>
                        <p className="text-[8px] font-bold text-gray-400 mt-2 uppercase tracking-widest">PDF, DOCX (Max 10MB)</p>
                      </label>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-500 leading-relaxed mb-4">
                    Chứng minh khả năng thực hiện dự án bằng cách tải lên CV hoặc các tài liệu liên quan.
                  </p>
                  <a 
                    href="/templates/Mau_CV_Thien_Nguyen.docx" 
                    download
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                  >
                    <Download className="h-3 w-3" />
                    Mẫu hồ sơ (.docx)
                  </a>
                </div>

                {kycData?.status === 'PENDING' && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-amber-800 uppercase tracking-tight">Hồ sơ đang chờ kiểm duyệt</p>
                      <p className="text-[9px] font-medium text-amber-600 leading-tight">Nhân viên hệ thống đang tiến hành kiểm duyệt thông tin của bạn. Kết quả sẽ có trong vòng 24 giờ tới.</p>
                    </div>
                  </div>
                )}

                {kycData?.status === 'REJECTED' && (
                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-red-800 uppercase tracking-tight">Hồ sơ bị từ chối</p>
                      <div className="space-y-1 mt-0.5">
                        <p className="text-[9px] font-bold text-red-600 leading-tight">Lý do: {kycData.rejectionReason || 'Dữ liệu không khớp hoặc ảnh mờ.'}</p>
                        <p className="text-[8px] font-medium text-red-500/80 leading-tight italic">* Vui lòng chỉnh sửa thông tin bị sai và nhấn "Nộp hồ sơ xác thực" bên dưới để gửi lại.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {kycData?.status !== 'PENDING' && kycData?.status !== 'APPROVED' && (
                <div className="mt-auto pt-4">
                  <button 
                    onClick={handleFinalSubmit}
                    disabled={isSubmittingAll} 
                    className="w-full py-3.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    Nộp hồ sơ xác thực
                  </button>
                  <p className="text-[8px] text-center text-gray-400 uppercase font-bold tracking-widest mt-3">
                    Thông tin sẽ được nhân viên xét duyệt trong 24h
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
