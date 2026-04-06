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
    userName?: string;
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
        idNumber?: string;
        issueDate?: string;
        expiryDate?: string;
        issuePlace?: string;
        images?: string;
    }>({});
    const [formData, setFormData] = useState({
        userId: userId ? String(userId) : '',
        idType: 'CCCD',
        idNumber: '',
        issueDate: null as Date | null,
        expiryDate: null as Date | null,
        issuePlace: '',
        idImageFront: '',
        idImageBack: '',
        selfieImage: ''
    });

    useEffect(() => {
        if (userId) {
            setFormData(prev => ({ ...prev, userId: String(userId) }));
            checkExistingKYC(String(userId));
        }
    }, [userId]);

    const checkExistingKYC = async (uid: string) => {
        setFetching(true);
        try {
            const data = await kycService.getByUserId(uid);
            if (data) {
                setFormData({
                    userId: String(data.userId),
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
            }
        } catch (error: any) {
            // 404 is expected if no KYC exists, so we don't log it
            if (error.response?.status !== 404) {
                console.error('Error fetching KYC:', error);
                // Only show error toast for actual server errors, not for "not found"
                if (error.response?.status === 500) {
                    toast.error('Lỗi máy chủ khi kiểm tra KYC. Vui lòng thử lại sau.');
                }
            }
            setIsUpdate(false);
        } finally {
            setFetching(false);
        }
    };

    const validateIdNumber = (value: string, idType: string): string | undefined => {
        if (!value) return 'Vui lòng nhập số định danh';

        if (idType === 'CCCD') {
            if (!/^\d{12}$/.test(value)) {
                return 'CCCD/CMND phải gồm đúng 12 chữ số';
            }
        } else if (idType === 'PASSPORT') {
            // Hộ chiếu VN: 1-2 chữ cái + 6-8 chữ số (tổng 7-9 ký tự), không phân biệt hoa/thường
            if (!/^[A-Za-z]{1,2}[0-9]{6,8}$/.test(value)) {
                return 'Số hộ chiếu không hợp lệ (VD: B1234567 hoặc AB1234567)';
            }
        } else if (idType === 'DRIVER_LICENSE') {
            if (!/^\d{12}$/.test(value)) {
                return 'Số bằng lái xe phải gồm đúng 12 chữ số';
            }
        }
        return undefined;
    };

    const validateDates = (issueDate: Date | null, expiryDate: Date | null): { issueDate?: string; expiryDate?: string } => {
        const errors: { issueDate?: string; expiryDate?: string } = {};

        if (!issueDate) {
            errors.issueDate = 'Vui lòng chọn ngày cấp';
        }
        if (!expiryDate) {
            errors.expiryDate = 'Vui lòng chọn ngày hết hạn';
        }

        if (issueDate && expiryDate) {
            if (issueDate >= expiryDate) {
                errors.expiryDate = 'Ngày hết hạn phải sau ngày cấp';
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (issueDate > today) {
                errors.issueDate = 'Ngày cấp không được là ngày trong tương lai';
            }
        }

        return errors;
    };

    const validateIssuePlace = (value: string): string | undefined => {
        if (!value || !value.trim()) return 'Vui lòng nhập nơi cấp';
        if (value.trim().length < 3) {
            return 'Nơi cấp phải có ít nhất 3 ký tự';
        }
        return undefined;
    };

    // Convert Date to YYYY-MM-DD for API
    const formatDateForAPI = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Real-time validation
        if (name === 'idNumber') {
            const error = validateIdNumber(value, formData.idType);
            setErrors(prev => ({ ...prev, idNumber: error }));
        } else if (name === 'idType') {
            // Re-validate ID number when type changes
            const error = validateIdNumber(formData.idNumber, value);
            setErrors(prev => ({ ...prev, idNumber: error }));
        } else if (name === 'issuePlace') {
            const error = validateIssuePlace(value);
            setErrors(prev => ({ ...prev, issuePlace: error }));
        }
    };

    const handleDateChange = (name: 'issueDate' | 'expiryDate', date: Date | null) => {
        // Update form data
        const updatedFormData = {
            ...formData,
            [name]: date
        };
        setFormData(updatedFormData);

        // Validate with the new date
        const issueDate = name === 'issueDate' ? date : updatedFormData.issueDate;
        const expiryDate = name === 'expiryDate' ? date : updatedFormData.expiryDate;

        const dateErrors = validateDates(issueDate, expiryDate);

        // Update errors: clear errors that are no longer present
        setErrors(prev => {
            const nextErrors = { ...prev, ...dateErrors };

            // If the current field being changed has no error in dateErrors, 
            // but it had an error in prev, we need to explicitly clear it.
            if (!dateErrors.issueDate) delete nextErrors.issueDate;
            if (!dateErrors.expiryDate) delete nextErrors.expiryDate;

            return nextErrors;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: typeof errors = {
            idNumber: validateIdNumber(formData.idNumber, formData.idType),
            ...validateDates(formData.issueDate, formData.expiryDate),
            issuePlace: validateIssuePlace(formData.issuePlace),
        };

        // Check images — mặt sau chỉ bắt buộc với CCCD và DRIVER_LICENSE
        const needsBackImage = formData.idType !== 'PASSPORT';
        if (!formData.idImageFront || (needsBackImage && !formData.idImageBack) || !formData.selfieImage) {
            newErrors.images = needsBackImage
                ? 'Vui lòng tải lên ảnh mặt trước, mặt sau và ảnh chân dung'
                : 'Vui lòng tải lên ảnh hộ chiếu và ảnh chân dung';
        }

        setErrors(newErrors);

        // Nếu có lỗi thì dừng lại — lỗi hiện inline ngay dưới từng ô
        if (Object.values(newErrors).some(error => error !== undefined)) {
            return;
        }

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
                selfieImage: formData.selfieImage
            };

            if (isUpdate) {
                await kycService.update(formData.userId, payload);
                toast.success('KYC updated successfully!');
            } else {
                await kycService.submit(formData.userId, payload);
                toast.success('KYC submitted successfully!');
            }
            onSuccess();
        } catch (error: any) {
            console.error('KYC Submit Error:', error);
            if (error.response?.data) {
                console.log('Error Data:', error.response.data);
            }
            const msg = error.response?.data?.message || error.message || 'Failed to submit KYC';
            toast.error(msg);
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

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            if (data?.publicUrl) {
                const imageUrl = data.publicUrl;
                setFormData(prev => ({ ...prev, [fieldName]: imageUrl }));
                setErrors(prev => ({ ...prev, images: undefined }));

                // Trigger AI OCR for Front or Back ID images
                if (fieldName === 'idImageFront' || fieldName === 'idImageBack') {
                    toast.promise(
                        aiService.ocrKYC(file),
                        {
                            loading: 'AI đang phân tích và trích xuất thông tin...',
                            success: (ocrData: any) => {
                                if (ocrData.error) {
                                    throw new Error(ocrData.error);
                                }
                                setFormData(prev => ({
                                    ...prev,
                                    idType: ocrData.idType || prev.idType,
                                    idNumber: ocrData.idNumber || prev.idNumber,
                                    issueDate: ocrData.issueDate ? new Date(ocrData.issueDate) : prev.issueDate,
                                    expiryDate: ocrData.expiryDate ? new Date(ocrData.expiryDate) : prev.expiryDate,
                                    issuePlace: ocrData.issuePlace || prev.issuePlace
                                }));
                                const docLabel = ocrData.idType === 'PASSPORT' ? 'Hộ chiếu' : ocrData.idType === 'DRIVER_LICENSE' ? 'Bằng lái xe' : 'CCCD';
                                return `AI đã nhận diện ${docLabel} và điền thông tin ${fieldName === 'idImageFront' ? 'mặt trước' : 'mặt sau'} thành công!`;
                            },
                            error: (err: any) => err.message || 'AI không thể đọc được nội dung ảnh này. Vui lòng kiểm tra lại.'
                        },
                        {
                            style: {
                                minWidth: '300px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            },
                            success: { duration: 5000 }
                        }
                    );
                }
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading image: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    if (fetching) {
        return <div className="p-4 text-center">Đang kiểm tra hồ sơ KYC hiện có...</div>;
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
                            Hướng dẫn:{' '}
                            <span className="font-medium normal-case text-gray-700">
                                {formData.idType === 'PASSPORT'
                                    ? <>Chỉ cần tải <span className="font-bold text-[#446b5f]">trang ảnh Hộ chiếu</span> lên, hệ thống sẽ dùng AI tự động trích xuất và điền thông tin bên dưới.</>
                                    : formData.idType === 'DRIVER_LICENSE'
                                    ? <>Chỉ cần tải <span className="font-bold text-[#446b5f]">Mặt trước</span> và <span className="font-bold text-[#446b5f]">Mặt sau</span> của Bằng lái xe lên, hệ thống sẽ dùng AI tự động trích xuất và điền thông tin bên dưới.</>
                                    : <>Chỉ cần tải <span className="font-bold text-[#446b5f]">Mặt trước</span> và <span className="font-bold text-[#446b5f]">Mặt sau</span> của CCCD lên, hệ thống sẽ dùng AI tự động trích xuất và điền thông tin bên dưới.</>
                                }
                            </span>
                        </p>
                    </div>
                </div>
            )}


            <div className="space-y-4 mb-8 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-300">
                <label className="block text-sm font-bold text-[#446b5f] uppercase tracking-wider">
                    Tài liệu định danh (Tự động trích xuất)
                </label>

                <div className={`grid grid-cols-1 gap-4 ${formData.idType === 'PASSPORT' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    {/* Front ID */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                            {formData.idType === 'PASSPORT' ? 'Trang ảnh Hộ chiếu' :
                             formData.idType === 'DRIVER_LICENSE' ? 'Mặt trước Bằng lái xe' : 'Mặt trước CCCD'}
                        </p>
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleFileUpload(e, 'idImageFront')}
                                className="block w-full text-[10px] text-gray-500
                                    file:mr-3 file:py-1 file:px-3
                                    file:rounded-full file:border-0
                                    file:text-[10px] file:font-bold
                                    file:bg-[#446b5f]/10 file:text-[#446b5f]
                                    hover:file:bg-[#446b5f]/20"
                                disabled={uploading || readOnly}
                            />
                            {formData.idImageFront && (
                                <div className="relative group cursor-pointer" onClick={() => onImageClick?.(formData.idImageFront)}>
                                    <img src={formData.idImageFront} alt="Front ID" className="h-20 w-full object-cover rounded border border-gray-100" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded flex items-center justify-center transition-all">
                                        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back ID — ẩn với Passport */}
                    {formData.idType !== 'PASSPORT' && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                                {formData.idType === 'DRIVER_LICENSE' ? 'Mặt sau Bằng lái xe' : 'Mặt sau CCCD'}
                            </p>
                            <div className="space-y-3">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => handleFileUpload(e, 'idImageBack')}
                                    className="block w-full text-[10px] text-gray-500
                                        file:mr-3 file:py-1 file:px-3
                                        file:rounded-full file:border-0
                                        file:text-[10px] file:font-bold
                                        file:bg-[#446b5f]/10 file:text-[#446b5f]
                                        hover:file:bg-[#446b5f]/20"
                                    disabled={uploading || readOnly}
                                />
                                {formData.idImageBack && (
                                    <div className="relative group cursor-pointer" onClick={() => onImageClick?.(formData.idImageBack)}>
                                        <img src={formData.idImageBack} alt="Back ID" className="h-20 w-full object-cover rounded border border-gray-100" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded flex items-center justify-center transition-all">
                                            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selfie */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Ảnh chân dung</p>
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleFileUpload(e, 'selfieImage')}
                                className="block w-full text-[10px] text-gray-500
                                    file:mr-3 file:py-1 file:px-3
                                    file:rounded-full file:border-0
                                    file:text-[10px] file:font-bold
                                    file:bg-[#446b5f]/10 file:text-[#446b5f]
                                    hover:file:bg-[#446b5f]/20"
                                disabled={uploading || readOnly}
                            />
                            {formData.selfieImage && (
                                <div className="relative group cursor-pointer mx-auto w-fit" onClick={() => onImageClick?.(formData.selfieImage)}>
                                    <img src={formData.selfieImage} alt="Selfie" className="h-20 w-20 object-cover rounded-full border border-gray-100" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-full flex items-center justify-center transition-all">
                                        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {uploading && <p className="text-[10px] text-[#446b5f] font-bold animate-pulse text-center">Đang tải và xử lý bằng AI...</p>}
                {errors.images && (
                    <p className="text-xs text-red-600 font-semibold text-center">{errors.images}</p>
                )}
            </div>

            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Người dùng</label>
                <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-sm">
                    {userName ? (
                        <span className="font-medium text-gray-900">{userName}</span>
                    ) : (
                        <span className="text-gray-500">Mã người dùng (ID): {userId}</span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Loại định danh</label>
                    <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#446b5f] focus:ring-[#446b5f] sm:text-sm border p-2"
                        disabled={readOnly}
                    >
                        <option value="CCCD">CCCD</option>
                        <option value="PASSPORT">Hộ chiếu (Passport)</option>
                        <option value="DRIVER_LICENSE">Bằng lái xe</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {formData.idType === 'PASSPORT' ? 'Số hộ chiếu'
                         : formData.idType === 'DRIVER_LICENSE' ? 'Số bằng lái xe'
                         : 'Số CCCD/CMND'}
                    </label>
                    <input
                        type="text"
                        name="idNumber"
                        required
                        value={formData.idNumber}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.idNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#446b5f]'}`}
                        placeholder={
                            formData.idType === 'PASSPORT' ? 'VD: B1234567'
                            : formData.idType === 'DRIVER_LICENSE' ? '12 chữ số'
                            : '12 chữ số'
                        }
                        maxLength={formData.idType === 'PASSPORT' ? 9 : 12}
                        disabled={readOnly}
                    />
                    {errors.idNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.idNumber}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày cấp</label>
                    <DatePicker
                        selected={formData.issueDate}
                        onChange={(date: Date | null) => handleDateChange('issueDate', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.issueDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#446b5f]'
                            }`}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        required
                        disabled={readOnly}
                    />
                    {errors.issueDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.issueDate}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày hết hạn</label>
                    <DatePicker
                        selected={formData.expiryDate}
                        onChange={(date: Date | null) => handleDateChange('expiryDate', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.expiryDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#446b5f]'
                            }`}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        minDate={formData.issueDate || undefined}
                        required
                        disabled={readOnly}
                    />
                    {errors.expiryDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nơi cấp</label>
                <input
                    type="text"
                    name="issuePlace"
                    required
                    value={formData.issuePlace}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#446b5f] sm:text-sm border p-2 ${errors.issuePlace ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#446b5f]'
                        }`}
                    placeholder="VD: Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                    disabled={readOnly}
                />
                {errors.issuePlace && (
                    <p className="mt-1 text-xs text-red-600">{errors.issuePlace}</p>
                )}
            </div>


            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#446b5f]"
                        disabled={uploading || loading || fetching}
                    >
                        Đóng
                    </button>
                )}
                {!readOnly && (
                    <button
                        type="submit"
                        disabled={loading || uploading || fetching || Object.values(errors).some(error => error !== undefined)}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#446b5f] text-base font-medium text-white hover:bg-[#35534a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#446b5f] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang gửi...' : uploading ? 'Đang tải lên...' : isUpdate ? 'Cập nhật KYC' : 'Gửi KYC'}
                    </button>
                )}
            </div>
            </div>
        </form>
    );
}
