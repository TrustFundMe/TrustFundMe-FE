'use client';

import React, { useState, useEffect } from 'react';
import { kycService } from '@/services/kycService';
import { supabase } from '@/lib/supabaseClient';
import { aiService } from '@/services/aiService';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ZoomIn, Shield } from 'lucide-react';

interface KYCInputFormProps {
    userId?: number | string;
    userName?: string;  // fallback — OCR fullName is preferred
    onSuccess: () => void;
    onCancel?: () => void;
    readOnly?: boolean;
    onImageClick?: (url: string) => void;
    isStaff?: boolean;
    onDataChange?: (data: any) => void;
    hideSubmitButton?: boolean;
    initialData?: any;
}

export default function KYCInputForm({ userId, userName, onSuccess, onCancel, readOnly, onImageClick, isStaff = true, onDataChange, hideSubmitButton, initialData }: KYCInputFormProps) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [errors, setErrors] = useState<{
        fullName?: string;
        idNumber?: string;
        issueDate?: string;
        expiryDate?: string;
        issuePlace?: string;
        images?: string;
    }>({});

    const initialFormState = {
        userId: userId ? String(userId) : '',
        fullName: '',
        address: '',
        workplace: '',
        taxId: '',
        idType: 'CCCD',
        idNumber: '',
        issueDate: null as Date | null,
        expiryDate: null as Date | null,
        issuePlace: '',
        idImageFront: '',
        idImageBack: '',
        selfieImage: ''
    };

    // ── Form state — includes all OCR fields ──
    const [formData, setFormData] = useState(initialData || initialFormState);

    useEffect(() => {
        // Sync to parent whenever formData changes
        onDataChange?.(formData);
    }, [formData, onDataChange]);

    useEffect(() => {
        // Only run initialization/fetch if we don't have preserved state (initialData)
        if (userId && !initialData) {
            // Reset to clean state for new user
            const newState = {
                ...initialFormState,
                userId: String(userId),
                fullName: userName || ''
            };
            setFormData(newState);
            // onDataChange will be triggered by the sync effect
            setErrors({});
            checkExistingKYC(String(userId));
        }
    }, [userId, userName, initialData]);

    const checkExistingKYC = async (uid: string) => {
        setFetching(true);
        try {
            // Use getMyKyc for non-staff (avoids 500/403 on /api/kyc/user/{id})
            const data = isStaff
                ? await kycService.getByUserId(uid)
                : await kycService.getMyKyc();
            if (data) {
                const loadedData = {
                    userId: String(data.userId),
                    fullName: data.fullName || '',
                    address: data.address || '',
                    workplace: data.workplace || '',
                    taxId: data.taxId || '',
                    idType: data.idType || 'CCCD',
                    idNumber: data.idNumber || '',
                    issueDate: data.issueDate ? new Date(data.issueDate) : null,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                    issuePlace: data.issuePlace || '',
                    idImageFront: data.idImageFront || '',
                    idImageBack: data.idImageBack || '',
                    selfieImage: data.selfieImage || ''
                };
                setFormData(loadedData);
                setIsUpdate(true);
                onDataChange?.(loadedData);
            } else {
                setIsUpdate(false);
            }
        } catch (error: any) {
            console.log('No existing KYC or error:', error.response?.status);
            setIsUpdate(false);
        } finally {
            setFetching(false);
        }
    };

    const validateIdNumber = (value: string, idType: string): string | undefined => {
        if (!value) return 'Vui lòng nhập số định danh';
        if (idType === 'CCCD' && !/^\d{12}$/.test(value)) return 'CCCD/CMND phải gồm đúng 12 chữ số';
        if (idType === 'PASSPORT' && !/^[A-Za-z]{1,2}[0-9]{6,8}$/.test(value)) return 'Số hộ chiếu không hợp lệ (VD: B1234567 hoặc AB1234567)';
        if (idType === 'DRIVER_LICENSE' && !/^\d{12}$/.test(value)) return 'Số bằng lái xe phải gồm đúng 12 chữ số';
        return undefined;
    };

    const validateFullName = (value: string): string | undefined => {
        if (!value || !value.trim()) return 'Vui lòng nhập họ và tên (theo giấy tờ)';
        if (value.trim().length < 4) return 'Họ và tên phải có ít nhất 4 ký tự';
        return undefined;
    };

    const validateTaxId = (value: string): string | undefined => {
        if (!value) return undefined;
        if (!/^\d{10}(-\d{3})?$/.test(value) && !/^\d{10}$/.test(value) && !/^\d{13}$/.test(value)) return 'Mã số thuế phải đúng định dạng 10 số hoặc 13 số';
        return undefined;
    };

    const validateDates = (issueDate: Date | null, expiryDate: Date | null): { issueDate?: string; expiryDate?: string } => {
        const errors: { issueDate?: string; expiryDate?: string } = {};
        if (!issueDate) errors.issueDate = 'Vui lòng chọn ngày cấp';
        if (!expiryDate) errors.expiryDate = 'Vui lòng chọn ngày hết hạn';
        if (issueDate && expiryDate) {
            if (issueDate >= expiryDate) {
                errors.expiryDate = 'Ngày hết hạn phải sau ngày cấp';
            } else {
                // Cách nhau ít nhất 1 năm để đúng thực tế các loại giấy tờ
                const diffTime = expiryDate.getTime() - issueDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 365 && expiryDate.getFullYear() !== 2099) { // Bỏ qua nếu là vô thời hạn 2099
                    errors.expiryDate = 'Ngày hết hạn phải cách ngày cấp ít nhất 1 năm';
                }
            }
        }
        if (issueDate && issueDate > new Date()) errors.issueDate = 'Ngày cấp không được là ngày trong tương lai';
        return errors;
    };

    const validateIssuePlace = (value: string): string | undefined => {
        if (!value?.trim()) return 'Vui lòng nhập nơi cấp';
        if (value.trim().length < 3) return 'Nơi cấp phải có ít nhất 3 ký tự';
        return undefined;
    };

    const formatDateForAPI = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        onDataChange?.(updated);
        if (name === 'fullName') {
            const err = validateFullName(value);
            setErrors(prev => ({ ...prev, fullName: err }));
        } else if (name === 'idNumber') {
            setErrors(prev => ({ ...prev, idNumber: validateIdNumber(value, formData.idType) }));
        } else if (name === 'idType') {
            setErrors(prev => ({ ...prev, idNumber: validateIdNumber(formData.idNumber, value) }));
        } else if (name === 'issuePlace') {
            setErrors(prev => ({ ...prev, issuePlace: validateIssuePlace(value) }));
        } else if (name === 'taxId') {
            setErrors(prev => ({ ...prev, taxId: validateTaxId(value) as any }));
        }
    };

    const handleDateChange = (name: 'issueDate' | 'expiryDate', date: Date | null) => {
        const updated = { ...formData, [name]: date };
        setFormData(updated);
        onDataChange?.(updated);
        const issueDate = name === 'issueDate' ? date : updated.issueDate;
        const expiryDate = name === 'expiryDate' ? date : updated.expiryDate;
        const dateErrors = validateDates(issueDate, expiryDate);
        setErrors(prev => {
            const next = { ...prev, ...dateErrors };
            if (!dateErrors.issueDate) delete next.issueDate;
            if (!dateErrors.expiryDate) delete next.expiryDate;
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof errors = {
            fullName: validateFullName(formData.fullName),
            idNumber: validateIdNumber(formData.idNumber, formData.idType),
            ...validateDates(formData.issueDate, formData.expiryDate),
            issuePlace: validateIssuePlace(formData.issuePlace),
            taxId: validateTaxId(formData.taxId) as any,
            address: !formData.address?.trim() ? 'Vui lòng nhập địa chỉ cư trú' : undefined,
        };

        const needsBackImage = formData.idType !== 'PASSPORT';
        if (!formData.idImageFront || (needsBackImage && !formData.idImageBack) || !formData.selfieImage) {
            newErrors.images = needsBackImage
                ? 'Vui lòng tải lên ảnh mặt trước, mặt sau và ảnh chân dung'
                : 'Vui lòng tải lên ảnh hộ chiếu và ảnh chân dung';
        }

        setErrors(newErrors);
        if (Object.values(newErrors).some(error => error !== undefined)) return;

        setLoading(true);
        try {
            const payload = {
                idType: formData.idType,
                idNumber: formData.idNumber,
                issueDate: formatDateForAPI(formData.issueDate),
                expiryDate: formatDateForAPI(formData.expiryDate),
                issuePlace: formData.issuePlace,
                idImageFront: formData.idImageFront,
                idImageBack: formData.idImageBack,
                selfieImage: formData.selfieImage,
                // ── OCR fields ──
                fullName: formData.fullName,
                address: formData.address,
                workplace: formData.workplace || undefined,
                taxId: formData.taxId || undefined,
            };

            let kycRecord;
            if (isUpdate) {
                kycRecord = await kycService.update(formData.userId, payload);
            } else {
                kycRecord = await kycService.submit(formData.userId, payload);
            }

            // Tự động duyệt nếu là Staff thực hiện, User gửi thì để PENDING (mặc định của server)
            if (isStaff && kycRecord && kycRecord.id) {
                await kycService.updateStatus(kycRecord.id, 'APPROVED');
                toast.success('Gửi và duyệt KYC thành công!');
            } else {
                toast.success('Gửi hồ sơ KYC thành công! Vui lòng chờ phê duyệt.');
            }
            onSuccess();
        } catch (error: any) {
            console.error('KYC Submit Error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to submit KYC');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${formData.userId}_${fieldName}_${Date.now()}.${fileExt}`;
            const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || process.env.SHARED_SUPABASE_BUCKET || 'TrustFundMe';
            const filePath = `kyc-documents/${fileName}`;

            const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            if (data?.publicUrl) {
                const imageUrl = data.publicUrl;
                setFormData(prev => ({ ...prev, [fieldName]: imageUrl }));
                setErrors(prev => ({ ...prev, images: undefined }));

                // Trigger AI OCR on front/back ID images
                if (fieldName === 'idImageFront' || fieldName === 'idImageBack') {
                    toast.promise(
                        aiService.ocrKYC(file, fieldName === 'idImageBack' ? 'back' : 'front'),
                        {
                            loading: 'AI đang phân tích và trích xuất thông tin...',
                            success: (ocrResult: any) => {
                                if (ocrResult.error) {
                                    throw new Error(ocrResult.error);
                                }

                                const isValidStr = (val: string | null | undefined) => {
                                    if (!val) return false;
                                    const lower = String(val).toLowerCase().trim();
                                    return !['n/a', 'none', 'null', 'không có', 'không xác định', 'không', 'undefined'].includes(lower);
                                };

                                const parseDateSafely = (dateStr: any, prevDate: any) => {
                                    if (!dateStr || !isValidStr(dateStr)) return prevDate;
                                    const lower = String(dateStr).toLowerCase().trim();
                                    if (lower.includes('không thời hạn') || lower.includes('vô thời hạn')) {
                                        return new Date('2099-12-31'); // Đại diện cho vô thời hạn
                                    }

                                    let d = new Date(dateStr);
                                    if (isNaN(d.getTime())) {
                                        const parts = String(dateStr).split(/[-\/]/); // Handle DD/MM/YYYY or DD-MM-YYYY
                                        if (parts.length === 3 && parts[2].length === 4) { // YYYY is at the end
                                            d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                        }
                                    }
                                    return isNaN(d.getTime()) ? prevDate : d;
                                };

                                const isBack = fieldName === 'idImageBack';
                                if (isBack) {
                                    // Mặt sau: CHỈ cập nhật issueDate và issuePlace, KHÔNG được chạm vào idNumber hay các trường mặt trước
                                    setFormData(prev => ({
                                        ...prev,
                                        issueDate: parseDateSafely(ocrResult.issueDate, prev.issueDate),
                                        issuePlace: isValidStr(ocrResult.issuePlace) ? ocrResult.issuePlace : prev.issuePlace,
                                    }));
                                    return `AI trích xuất thông tin mặt sau thành công!`;
                                } else {
                                    // Mặt trước: cập nhật tất cả các trường thông tin
                                    setFormData(prev => ({
                                        ...prev,
                                        idType: isValidStr(ocrResult.idType) ? ocrResult.idType : prev.idType,
                                        idNumber: isValidStr(ocrResult.idNumber) ? ocrResult.idNumber : prev.idNumber,
                                        fullName: isValidStr(ocrResult.fullName) ? ocrResult.fullName : prev.fullName,
                                        address: isValidStr(ocrResult.placeOfResidence) ? ocrResult.placeOfResidence : (isValidStr(ocrResult.placeOfOrigin) ? ocrResult.placeOfOrigin : prev.address),
                                        issueDate: parseDateSafely(ocrResult.issueDate, prev.issueDate),
                                        expiryDate: parseDateSafely(ocrResult.expiryDate, prev.expiryDate),
                                        issuePlace: isValidStr(ocrResult.issuePlace) ? ocrResult.issuePlace : prev.issuePlace,
                                    }));
                                    const docLabel = ocrResult.idType === 'PASSPORT' ? 'Hộ chiếu'
                                        : ocrResult.idType === 'DRIVER_LICENSE' ? 'Bằng lái xe' : 'CCCD';
                                    return `AI trích xuất thông tin từ ${docLabel} thành công!`;
                                }
                            },
                            error: (err: any) => err.message || 'AI không thể đọc được nội dung ảnh này.'
                        },
                        { style: { minWidth: '300px', fontSize: '12px', fontWeight: 'bold' }, success: { duration: 5000 } }
                    );
                }
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('Lỗi tải ảnh: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input so the user can re-upload the same file after deleting
        }
    };

    if (fetching) {
        return <div className="p-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang kiểm tra hồ sơ KYC hiện có...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-12 gap-3">
                {/* ── Left Column: Image Uploads (Compact Sidebar) ── */}
                <div className="col-span-5 space-y-2">
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-6 rounded-lg bg-black flex items-center justify-center text-white">
                                <Shield className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Giấy tờ tùy thân</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {/* Front Image */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase text-center">Mặt trước</p>
                                <div className="relative">
                                    <div className="aspect-[3/2] bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group shadow-sm">
                                        {formData.idImageFront ? (
                                            <>
                                                <img src={formData.idImageFront} alt="Front" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <button type="button" onClick={() => onImageClick?.(formData.idImageFront)} className="p-1.5 bg-white rounded-lg shadow-xl hover:scale-110 transition-transform">
                                                        <ZoomIn className="w-4 h-4 text-black" />
                                                    </button>
                                                </div>
                                            </ >
                                        ) : (
                                            <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-all">
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'idImageFront')} disabled={readOnly || uploading} />
                                                <span className="text-gray-300 text-xl font-light">+</span>
                                            </label>
                                        )}
                                    </div>
                                    {!readOnly && formData.idImageFront && (
                                        <button type="button" onClick={() => setFormData(p => ({...p, idImageFront: ''}))} className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center border-2 border-white shadow-lg z-10 hover:bg-red-600 transition-colors">×</button>
                                    )}
                                </div>
                            </div>

                            {/* Back Image */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase text-center">Mặt sau</p>
                                <div className="relative">
                                    <div className="aspect-[3/2] bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group shadow-sm">
                                        {formData.idImageBack ? (
                                            <>
                                                <img src={formData.idImageBack} alt="Back" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <button type="button" onClick={() => onImageClick?.(formData.idImageBack)} className="p-1.5 bg-white rounded-lg shadow-xl hover:scale-110 transition-transform">
                                                        <ZoomIn className="w-4 h-4 text-black" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-all">
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'idImageBack')} disabled={readOnly || uploading} />
                                                <span className="text-gray-300 text-xl font-light">+</span>
                                            </label>
                                        )}
                                    </div>
                                    {!readOnly && formData.idImageBack && (
                                        <button type="button" onClick={() => setFormData(p => ({...p, idImageBack: ''}))} className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center border-2 border-white shadow-lg z-10 hover:bg-red-600 transition-colors">×</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Selfie Image */}
                        <div className="pt-2 border-t border-gray-100 flex flex-col items-center">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1.5">Ảnh chân dung (Selfie)</p>
                            <div className="relative">
                                <div className="h-20 w-20 bg-white rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group shadow-sm">
                                    {formData.selfieImage ? (
                                        <>
                                            <img src={formData.selfieImage} alt="Selfie" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                <button type="button" onClick={() => onImageClick?.(formData.selfieImage)} className="p-1.5 bg-white rounded-lg shadow-xl hover:scale-110 transition-transform">
                                                    <ZoomIn className="w-4 h-4 text-black" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-all">
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'selfieImage')} disabled={readOnly || uploading} />
                                            <span className="text-gray-300 text-xl font-light">+</span>
                                        </label>
                                    )}
                                </div>
                                {!readOnly && formData.selfieImage && (
                                    <button type="button" onClick={() => setFormData(p => ({...p, selfieImage: ''}))} className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center border-2 border-white shadow-lg z-10 hover:bg-red-600 transition-colors">×</button>
                                )}
                            </div>
                        </div>

                        {uploading && (
                            <div className="mt-2 p-2 bg-[#ff5e14]/5 rounded-lg">
                                <p className="text-[9px] text-[#ff5e14] font-black animate-pulse text-center uppercase tracking-widest leading-tight">Hệ thống đang trích xuất dữ liệu...</p>
                            </div>
                        )}
                    </div>
                    
                    {!readOnly && (
                        <div className="p-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-[8px] font-bold text-emerald-700 leading-tight italic text-center">
                                Tip: Chỉ cần tải ảnh giấy tờ lên, hệ thống sẽ tự động điền các thông tin cho bạn.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Right Column: Form Data (Dense Grid) ── */}
                <div className="col-span-7 bg-gray-50/30 rounded-3xl p-3 border border-gray-100 self-start">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {/* Họ và tên */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Họ và tên (Theo giấy tờ) <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="fullName" required value={formData.fullName} onChange={handleChange} disabled={readOnly}
                                className={`w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none ${errors.fullName ? 'border-red-500' : ''}`}
                                placeholder="VD: NGUYỄN VĂN A"
                            />
                            {errors.fullName && <p className="mt-0.5 text-[10px] text-red-500 font-bold">{errors.fullName}</p>}
                        </div>

                        {/* Địa chỉ cư trú */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Địa chỉ thường trú <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="address" value={formData.address} onChange={handleChange} disabled={readOnly}
                                className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none"
                                placeholder="Địa chỉ ghi trên giấy tờ tùy thân"
                            />
                        </div>

                        {/* Nơi làm việc */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Nơi làm việc</label>
                            <input
                                type="text" name="workplace" value={formData.workplace} onChange={handleChange} disabled={readOnly}
                                className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none"
                                placeholder="Tên cơ quan, tổ chức..."
                            />
                        </div>

                        {/* Mã số thuế */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Mã số thuế</label>
                            <input
                                type="text" name="taxId" value={formData.taxId} onChange={handleChange} disabled={readOnly}
                                className={`w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none ${errors.taxId ? 'border-red-500' : ''}`}
                                placeholder="10 hoặc 13 chữ số"
                            />
                        </div>

                        {/* Loại định danh */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Loại định danh <span className="text-red-500">*</span></label>
                            <select name="idType" value={formData.idType} onChange={handleChange} disabled={readOnly}
                                className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none appearance-none cursor-pointer">
                                <option value="CCCD">Căn cước công dân (CCCD)</option>
                                <option value="PASSPORT">Hộ chiếu (Passport)</option>
                                <option value="DRIVER_LICENSE">Bằng lái xe</option>
                            </select>
                        </div>

                        {/* Số định danh */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Số định danh <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="idNumber" required value={formData.idNumber} onChange={handleChange} disabled={readOnly}
                                className={`w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none ${errors.idNumber ? 'border-red-500' : ''}`}
                                placeholder="VD: 012345678901"
                            />
                            {errors.idNumber && <p className="mt-0.5 text-[10px] text-red-500 font-bold">{errors.idNumber}</p>}
                        </div>

                        {/* Ngày cấp */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Ngày cấp <span className="text-red-500">*</span></label>
                            <DatePicker
                                selected={formData.issueDate} onChange={(date: Date | null) => handleDateChange('issueDate', date)}
                                dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" disabled={readOnly}
                                className={`w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none ${errors.issueDate ? 'border-red-500' : ''}`}
                                showYearDropdown showMonthDropdown dropdownMode="select" maxDate={new Date()}
                            />
                        </div>

                        {/* Ngày hết hạn */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Ngày hết hạn <span className="text-red-500">*</span></label>
                            <DatePicker
                                selected={formData.expiryDate} onChange={(date: Date | null) => handleDateChange('expiryDate', date)}
                                dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" disabled={readOnly}
                                className={`w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none ${errors.expiryDate ? 'border-red-500' : ''}`}
                                showYearDropdown showMonthDropdown dropdownMode="select" minDate={formData.issueDate || undefined}
                            />
                        </div>

                        {/* Nơi cấp */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-0.5">Nơi cấp <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="issuePlace" required value={formData.issuePlace} onChange={handleChange} disabled={readOnly}
                                className={`w-full bg-white border-2 border-gray-100 focus:border-black rounded-xl px-4 py-2 text-sm font-bold transition-all outline-none ${errors.issuePlace ? 'border-red-500' : ''}`}
                                placeholder="Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit buttons (only if not hidden by parent) */}
            {!hideSubmitButton && !readOnly && (
                <div className="mt-4 flex justify-end gap-3">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all">
                            Đóng
                        </button>
                    )}
                    <button type="submit" disabled={loading || uploading || fetching}
                        className="px-10 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50">
                        {loading ? 'Đang xử lý...' : isStaff ? 'Duyệt & Lưu' : 'Gửi yêu cầu xác minh'}
                    </button>
                </div>
            )}
        </form>
    );
}