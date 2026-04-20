'use client';

import React, { useState, useEffect } from 'react';
import { kycService } from '@/services/kycService';
import { supabase } from '@/lib/supabaseClient';
import { aiService } from '@/services/aiService';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ZoomIn } from 'lucide-react';

interface KYCInputFormProps {
    userId?: number | string;
    userName?: string;  // fallback — OCR fullName is preferred
    onSuccess: () => void;
    onCancel?: () => void;
    readOnly?: boolean;
    onImageClick?: (url: string) => void;
}

export default function KYCInputForm({ userId, userName, onSuccess, onCancel, readOnly, onImageClick }: KYCInputFormProps) {
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
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (userId) {
            // Reset to clean state for new user
            setFormData({
                ...initialFormState,
                userId: String(userId),
                fullName: userName || ''
            });
            setErrors({});
            checkExistingKYC(String(userId));
        }
    }, [userId, userName]);

    const checkExistingKYC = async (uid: string) => {
        setFetching(true);
        try {
            const data = await kycService.getByUserId(uid);
            if (data) {
                setFormData({
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
                });
                setIsUpdate(true);
            } else {
                setIsUpdate(false);
            }
        } catch (error: any) {
            console.log('No existing KYC or error:', error.response?.status);
            setIsUpdate(false);
            // If error, ensure we keep the clean state set in useEffect
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
        setFormData(prev => ({ ...prev, [name]: value }));
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

            // Tự động duyệt vì Staff là người lập/cập nhật thông tin
            if (kycRecord && kycRecord.id) {
                await kycService.updateStatus(kycRecord.id, 'APPROVED');
            }

            toast.success('Gửi và duyệt KYC thành công!');
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {!readOnly && (
                <div className="bg-[#446b5f]/10 p-3 rounded-lg border-l-4 border-[#446b5f]">
                    <div className="flex gap-2 items-start">
                        <svg className="w-4 h-4 text-[#446b5f] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[11px] text-[#446b5f] font-bold uppercase tracking-tight leading-relaxed">
                            Hướng dẫn: Chỉ cần tải ảnh CCCD lên, hệ thống sẽ dùng AI tự động trích xuất và điền đầy đủ thông tin bên dưới.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Image upload section ── */}
            <div className="space-y-4 mb-8 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-300">
                <label className="block text-sm font-bold text-[#446b5f] uppercase tracking-wider">
                    Tài liệu định danh (Tự động trích xuất)
                </label>
                <div className={`grid grid-cols-1 gap-4 ${formData.idType === 'PASSPORT' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    {/* Front ID */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                            {formData.idType === 'PASSPORT' ? 'Trang ảnh Hộ chiếu'
                                : formData.idType === 'DRIVER_LICENSE' ? 'Mặt trước Bằng lái xe' : 'Mặt trước CCCD'}
                        </p>
                        <div className="space-y-3">
                            <input type="file" id="idImageFront" accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'idImageFront')}
                                className="hidden"
                                disabled={uploading || readOnly} />

                            {formData.idImageFront ? (
                                <div className="relative group">
                                    <div className="relative cursor-pointer" onClick={() => onImageClick?.(formData.idImageFront)}>
                                        <img
                                            src={formData.idImageFront}
                                            alt="Front ID"
                                            className="h-28 w-full object-cover rounded-xl border border-gray-100 shadow-sm"
                                            onError={() => setFormData(prev => ({ ...prev, idImageFront: '' }))}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-all">
                                            <ZoomIn className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    {/* Nút Xóa */}
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData(prev => ({ ...prev, idImageFront: '' }));
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10 border-2 border-white"
                                            title="Xóa ảnh"
                                        >
                                            <span className="text-[12px] font-black">×</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <label htmlFor="idImageFront" className="h-28 w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                                        <span className="text-gray-400 text-lg">+</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Tải lên</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Back ID */}
                    {formData.idType !== 'PASSPORT' && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                                {formData.idType === 'DRIVER_LICENSE' ? 'Mặt sau Bằng lái xe' : 'Mặt sau CCCD'}
                            </p>
                            <div className="space-y-3">
                                <input type="file" id="idImageBack" accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'idImageBack')}
                                    className="hidden"
                                    disabled={uploading || readOnly} />

                                {formData.idImageBack ? (
                                    <div className="relative group">
                                        <div className="relative cursor-pointer" onClick={() => onImageClick?.(formData.idImageBack)}>
                                            <img
                                                src={formData.idImageBack}
                                                alt="Back ID"
                                                className="h-28 w-full object-cover rounded-xl border border-gray-100 shadow-sm"
                                                onError={() => setFormData(prev => ({ ...prev, idImageBack: '' }))}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-all">
                                                <ZoomIn className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        {/* Nút Xóa */}
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData(prev => ({ ...prev, idImageBack: '' }));
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10 border-2 border-white"
                                                title="Xóa ảnh"
                                            >
                                                <span className="text-[12px] font-black">×</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <label htmlFor="idImageBack" className="h-28 w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                                            <span className="text-gray-400 text-lg">+</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Tải lên</span>
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selfie */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Ảnh chân dung</p>
                        <div className="space-y-3">
                            <input type="file" id="selfieImage" accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'selfieImage')}
                                className="hidden"
                                disabled={uploading || readOnly} />

                            {formData.selfieImage ? (
                                <div className="relative group mx-auto w-fit">
                                    <div className="relative cursor-pointer" onClick={() => onImageClick?.(formData.selfieImage)}>
                                        <img
                                            src={formData.selfieImage}
                                            alt="Selfie"
                                            className="h-28 w-28 object-cover rounded-full border-2 border-white shadow-md ring-4 ring-gray-50"
                                            onError={() => setFormData(prev => ({ ...prev, selfieImage: '' }))}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all">
                                            <ZoomIn className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    {/* Nút Xóa */}
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData(prev => ({ ...prev, selfieImage: '' }));
                                            }}
                                            className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10 border-2 border-white"
                                            title="Xóa ảnh"
                                        >
                                            <span className="text-[12px] font-black">×</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <label htmlFor="selfieImage" className="h-28 w-28 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-full hover:bg-gray-50 cursor-pointer transition-all">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                                        <span className="text-gray-400 text-lg">+</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase text-center px-2">Tải lên chân dung</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
                {uploading && <p className="text-[10px] text-[#446b5f] font-bold animate-pulse text-center">Đang tải và xử lý bằng AI...</p>}
                {errors.images && <p className="text-xs text-red-600 font-semibold text-center">{errors.images}</p>}
            </div>

            {/* ── OCR fields from document ── */}
            <div className="space-y-4">
                {/* Họ và tên (theo giấy tờ) — priority field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="VD: Nguyễn Văn A"
                        disabled={readOnly}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>

                {/* Địa chỉ thường trú */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ cư trú <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#446b5f] focus:ring-[#446b5f] sm:text-sm border p-2"
                        placeholder="VD: Số 123 Đường ABC, Phường X, Quận Y, TP. Hồ Chí Minh"
                        disabled={readOnly}
                    />
                </div>

                {/* Nơi làm việc + Mã số thuế */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nơi làm việc</label>
                        <input
                            type="text"
                            name="workplace"
                            value={formData.workplace}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#446b5f] focus:ring-[#446b5f] sm:text-sm border p-2"
                            placeholder="VD: Công ty ABC"
                            disabled={readOnly}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mã số thuế (nếu có)</label>
                        <input
                            type="text"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#446b5f] focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.taxId ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="VD: 0123456789"
                            maxLength={15}
                            disabled={readOnly}
                        />
                        {(errors as any).taxId && <p className="mt-1 text-xs text-red-600">{(errors as any).taxId}</p>}
                    </div>
                </div>

                {/* Read-only summary for approved KYC */}
                {readOnly && (formData.address || formData.workplace || formData.taxId) && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Thông tin bổ sung từ OCR</p>
                        {formData.address && <p className="text-xs text-gray-600"><span className="font-bold">Địa chỉ:</span> {formData.address}</p>}
                        {formData.workplace && <p className="text-xs text-gray-600"><span className="font-bold">Nơi làm việc:</span> {formData.workplace}</p>}
                        {formData.taxId && <p className="text-xs text-gray-600"><span className="font-bold">Mã số thuế:</span> {formData.taxId}</p>}
                    </div>
                )}

                {/* Loại định danh + Số định danh */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Loại định danh <span className="text-red-500">*</span></label>
                        <select name="idType" value={formData.idType} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#446b5f] focus:ring-[#446b5f] sm:text-sm border p-2"
                            disabled={readOnly}>
                            <option value="CCCD">CCCD</option>
                            <option value="PASSPORT">Hộ chiếu (Passport)</option>
                            <option value="DRIVER_LICENSE">Bằng lái xe</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {formData.idType === 'PASSPORT' ? 'Số hộ chiếu'
                                : formData.idType === 'DRIVER_LICENSE' ? 'Số bằng lái xe' : 'Số CCCD/CMND'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text" name="idNumber" required
                            value={formData.idNumber} onChange={handleChange}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.idNumber ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder={formData.idType === 'PASSPORT' ? 'VD: B1234567' : '12 chữ số'}
                            maxLength={formData.idType === 'PASSPORT' ? 9 : 12}
                            disabled={readOnly}
                        />
                        {errors.idNumber && <p className="mt-1 text-xs text-red-600">{errors.idNumber}</p>}
                    </div>
                </div>

                {/* Ngày cấp + Ngày hết hạn */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày cấp <span className="text-red-500">*</span></label>
                        <DatePicker
                            selected={formData.issueDate}
                            onChange={(date: Date | null) => handleDateChange('issueDate', date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.issueDate ? 'border-red-500' : 'border-gray-300'}`}
                            showYearDropdown showMonthDropdown dropdownMode="select"
                            maxDate={new Date()} required disabled={readOnly}
                        />
                        {errors.issueDate && <p className="mt-1 text-xs text-red-600">{errors.issueDate}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày hết hạn <span className="text-red-500">*</span></label>
                        <DatePicker
                            selected={formData.expiryDate}
                            onChange={(date: Date | null) => handleDateChange('expiryDate', date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                            showYearDropdown showMonthDropdown dropdownMode="select"
                            minDate={formData.issueDate || undefined} required disabled={readOnly}
                        />
                        {errors.expiryDate && <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>}
                    </div>
                </div>

                {/* Nơi cấp */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nơi cấp <span className="text-red-500">*</span></label>
                    <input
                        type="text" name="issuePlace" required
                        value={formData.issuePlace} onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.issuePlace ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="VD: Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                        disabled={readOnly}
                    />
                    {errors.issuePlace && <p className="mt-1 text-xs text-red-600">{errors.issuePlace}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <button type="button" onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
                            disabled={uploading || loading || fetching}>
                            Đóng
                        </button>
                    )}
                    {!readOnly && (
                        <button type="submit"
                            disabled={loading || uploading || fetching || Object.values(errors).some(e => e !== undefined)}
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#446b5f] text-sm font-black uppercase tracking-widest text-white hover:bg-[#35534a] disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Đang xử lý...' : uploading ? 'Đang tải ảnh...' : 'Duyệt & Lưu KYC'}
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}