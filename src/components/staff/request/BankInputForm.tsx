import React, { useState, useEffect } from 'react';
import { bankService } from '@/services/bankService';
import { toast } from 'react-hot-toast';

interface BankInputFormProps {
    userId?: number | string;
    onSuccess: () => void;
    onCancel?: () => void;
}

interface ValidationErrors {
    bankCode?: string;
    accountNumber?: string;
    accountHolderName?: string;
}

export default function BankInputForm({ userId, onSuccess, onCancel }: BankInputFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState({
        userId: userId ? String(userId) : '',
        bankCode: '',
        accountNumber: '',
        accountHolderName: ''
    });

    useEffect(() => {
        if (userId) {
            setFormData(prev => ({ ...prev, userId: String(userId) }));
        }
    }, [userId]);

    const validateBankCode = (value: string): string | undefined => {
        if (!value) return 'Bank code is required';
        if (!/^[A-Z]{3,10}$/.test(value)) {
            return 'Bank code must be 3-10 uppercase letters (e.g., VCB, TCB, BIDV)';
        }
        return undefined;
    };

    const validateAccountNumber = (value: string): string | undefined => {
        if (!value) return 'Account number is required';
        if (!/^\d{6,20}$/.test(value)) {
            return 'Account number must be 6-20 digits';
        }
        return undefined;
    };

    const validateAccountHolderName = (value: string): string | undefined => {
        if (!value) return 'Account holder name is required';
        if (value.length < 3) {
            return 'Name must be at least 3 characters';
        }
        if (!/^[A-Z\s]+$/.test(value)) {
            return 'Name must be uppercase letters only (e.g., NGUYEN VAN A)';
        }
        return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Auto-uppercase for bankCode and accountHolderName
        let processedValue = value;
        if (name === 'bankCode' || name === 'accountHolderName') {
            processedValue = value.toUpperCase();
        }

        setFormData({ ...formData, [name]: processedValue });

        // Real-time validation
        let error: string | undefined;
        if (name === 'bankCode') {
            error = validateBankCode(processedValue);
        } else if (name === 'accountNumber') {
            error = validateAccountNumber(processedValue);
        } else if (name === 'accountHolderName') {
            error = validateAccountHolderName(processedValue);
        }

        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: ValidationErrors = {
            bankCode: validateBankCode(formData.bankCode),
            accountNumber: validateAccountNumber(formData.accountNumber),
            accountHolderName: validateAccountHolderName(formData.accountHolderName),
        };

        setErrors(newErrors);

        // Check if there are any errors
        if (Object.values(newErrors).some(error => error !== undefined)) {
            toast.error('Please fix all validation errors');
            return;
        }

        setLoading(true);
        try {
            await bankService.submit(formData.userId, {
                bankCode: formData.bankCode,
                accountNumber: formData.accountNumber,
                accountHolderName: formData.accountHolderName,
                status: 'APPROVED'
            });
            toast.success('Bank Account submitted successfully!');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to submit Bank Account');
        } finally {
            setLoading(false);
        }
    };

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

            <div>
                <label className="block text-sm font-medium text-gray-700">Bank Code</label>
                <input
                    type="text"
                    name="bankCode"
                    required
                    value={formData.bankCode}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm border p-2 ${errors.bankCode ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                        }`}
                    placeholder="e.g. VCB, TCB, BIDV"
                    maxLength={10}
                />
                {errors.bankCode && (
                    <p className="mt-1 text-xs text-red-600">{errors.bankCode}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                    type="text"
                    name="accountNumber"
                    required
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm border p-2 ${errors.accountNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                        }`}
                    placeholder="6-20 digits"
                    maxLength={20}
                />
                {errors.accountNumber && (
                    <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input
                    type="text"
                    name="accountHolderName"
                    required
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm border p-2 ${errors.accountHolderName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                        }`}
                    placeholder="NGUYEN VAN A"
                />
                {errors.accountHolderName && (
                    <p className="mt-1 text-xs text-red-600">{errors.accountHolderName}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Must be uppercase letters only</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || Object.values(errors).some(error => error !== undefined)}
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Bank'}
                </button>
            </div>
        </form>
    );
}
