import React, { useState } from 'react';
import { bankService } from '@/services/bankService';

interface BankInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialUserId?: number | string;
}

export default function BankInputModal({ isOpen, onClose, onSuccess, initialUserId }: BankInputModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: initialUserId ? String(initialUserId) : '',
        bankCode: '',
        accountNumber: '',
        accountHolderName: ''
    });

    // Reset/Update form when initialUserId changes or modal opens
    React.useEffect(() => {
        if (isOpen && initialUserId) {
            setFormData(prev => ({ ...prev, userId: String(initialUserId) }));
        }
    }, [isOpen, initialUserId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await bankService.submit(formData.userId, {
                bankCode: formData.bankCode,
                accountNumber: formData.accountNumber,
                accountHolderName: formData.accountHolderName
            });
            alert('Bank Account submitted successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to submit Bank Account');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Add Bank Account for User</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User ID</label>
                        <input
                            type="number"
                            name="userId"
                            required
                            value={formData.userId}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="Enter User ID (e.g. 210)"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="e.g. VCB, TCB"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input
                            type="text"
                            name="accountNumber"
                            required
                            value={formData.accountNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                        <input
                            type="text"
                            name="accountHolderName"
                            required
                            value={formData.accountHolderName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="FULL NAME UPPERCASE"
                        />
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
