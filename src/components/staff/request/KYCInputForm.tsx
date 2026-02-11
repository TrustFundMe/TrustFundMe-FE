import React, { useState, useEffect } from 'react';
import { kycService } from '@/services/kycService';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface KYCInputFormProps {
    userId?: number | string;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function KYCInputForm({ userId, onSuccess, onCancel }: KYCInputFormProps) {
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
                    idType: data.idType,
                    idNumber: data.idNumber,
                    issueDate: data.issueDate ? new Date(data.issueDate) : null,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                    issuePlace: data.issuePlace,
                    idImageFront: data.idImageFront,
                    idImageBack: data.idImageBack,
                    selfieImage: data.selfieImage
                });
                setIsUpdate(true);
                toast.success('Found existing KYC record. Updating mode enabled.');
            }
        } catch (error: any) {
            // 404 is expected if no KYC exists, so we don't log it
            if (error.response?.status !== 404) {
                console.error('Error fetching KYC:', error);
                // Only show error toast for actual server errors, not for "not found"
                if (error.response?.status === 500) {
                    toast.error('Server error while checking KYC. Please try again later.');
                }
            }
            setIsUpdate(false);
        } finally {
            setFetching(false);
        }
    };

    const validateIdNumber = (value: string, idType: string): string | undefined => {
        if (!value) return 'ID number is required';

        if (idType === 'CCCD') {
            if (!/^\d{12}$/.test(value)) {
                return 'CCCD must be exactly 12 digits';
            }
        } else if (idType === 'PASSPORT') {
            if (!/^[A-Z0-9]{8,9}$/.test(value)) {
                return 'Passport must be 8-9 alphanumeric characters';
            }
        } else if (idType === 'DRIVER_LICENSE') {
            if (!/^\d{12}$/.test(value)) {
                return 'Driver License must be 12 digits';
            }
        }
        return undefined;
    };

    const validateDates = (issueDate: Date | null, expiryDate: Date | null): { issueDate?: string; expiryDate?: string } => {
        const errors: { issueDate?: string; expiryDate?: string } = {};

        if (!issueDate) {
            errors.issueDate = 'Issue date is required';
        }
        if (!expiryDate) {
            errors.expiryDate = 'Expiry date is required';
        }

        if (issueDate && expiryDate) {
            if (issueDate >= expiryDate) {
                errors.expiryDate = 'Expiry date must be after issue date';
            }

            // Check if issue date is not in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (issueDate > today) {
                errors.issueDate = 'Issue date cannot be in the future';
            }
        }

        return errors;
    };

    const validateIssuePlace = (value: string): string | undefined => {
        if (!value) return 'Issue place is required';
        if (value.length < 3) {
            return 'Issue place must be at least 3 characters';
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

        // Check images
        if (!formData.idImageFront || !formData.idImageBack || !formData.selfieImage) {
            newErrors.images = 'All images are required';
            toast.error('Please upload all required images.');
        }

        setErrors(newErrors);

        // Check if there are any errors
        if (Object.values(newErrors).some(error => error !== undefined)) {
            toast.error('Please fix all validation errors');
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
            console.error(error);
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
            const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'TrustFundMe';
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
                setFormData(prev => ({ ...prev, [fieldName]: data.publicUrl }));
                // Clear image error when image is uploaded
                setErrors(prev => ({ ...prev, images: undefined }));
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading image: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    if (fetching) {
        return <div className="p-4 text-center">Checking for existing KYC record...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                    type="number"
                    name="userId"
                    required
                    value={formData.userId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-gray-50"
                    placeholder="Enter User ID"
                    readOnly={!!userId}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">ID Type</label>
                    <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    >
                        <option value="CCCD">CCCD</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="DRIVER_LICENSE">Driver License</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ID Number</label>
                    <input
                        type="text"
                        name="idNumber"
                        required
                        value={formData.idNumber}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm border p-2 ${errors.idNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                            }`}
                        placeholder={formData.idType === 'CCCD' ? '12 digits' : formData.idType === 'PASSPORT' ? '8-9 characters' : '12 digits'}
                        maxLength={formData.idType === 'PASSPORT' ? 9 : 12}
                    />
                    {errors.idNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.idNumber}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                    <DatePicker
                        selected={formData.issueDate}
                        onChange={(date: Date | null) => handleDateChange('issueDate', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm border p-2 ${errors.issueDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                            }`}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        required
                    />
                    {errors.issueDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.issueDate}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <DatePicker
                        selected={formData.expiryDate}
                        onChange={(date: Date | null) => handleDateChange('expiryDate', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm border p-2 ${errors.expiryDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                            }`}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        minDate={formData.issueDate || undefined}
                        required
                    />
                    {errors.expiryDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Issue Place</label>
                <input
                    type="text"
                    name="issuePlace"
                    required
                    value={formData.issuePlace}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm border p-2 ${errors.issuePlace ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                        }`}
                    placeholder="e.g., Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                />
                {errors.issuePlace && (
                    <p className="mt-1 text-xs text-red-600">{errors.issuePlace}</p>
                )}
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Documents</label>

                {/* Front ID */}
                <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Front ID Image</p>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'idImageFront')}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            disabled={uploading}
                        />
                        {formData.idImageFront && (
                            <img src={formData.idImageFront} alt="Front ID" className="h-12 w-20 object-cover rounded border" />
                        )}
                    </div>
                </div>

                {/* Back ID */}
                <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Back ID Image</p>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'idImageBack')}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            disabled={uploading}
                        />
                        {formData.idImageBack && (
                            <img src={formData.idImageBack} alt="Back ID" className="h-12 w-20 object-cover rounded border" />
                        )}
                    </div>
                </div>

                {/* Selfie */}
                <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Selfie Image</p>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'selfieImage')}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            disabled={uploading}
                        />
                        {formData.selfieImage && (
                            <img src={formData.selfieImage} alt="Selfie" className="h-12 w-12 object-cover rounded-full border" />
                        )}
                    </div>
                </div>
                {uploading && <p className="text-xs text-blue-600 animate-pulse">Uploading...</p>}
                {errors.images && (
                    <p className="text-xs text-red-600 font-semibold">{errors.images}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={uploading || loading || fetching}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || uploading || fetching || Object.values(errors).some(error => error !== undefined)}
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : uploading ? 'Uploading...' : isUpdate ? 'Update KYC' : 'Submit KYC'}
                </button>
            </div>
        </form>
    );
}
