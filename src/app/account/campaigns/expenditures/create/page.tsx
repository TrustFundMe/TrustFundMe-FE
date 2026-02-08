'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import { CreateExpenditureRequest, CreateExpenditureItemRequest } from '@/types/expenditure';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

export default function CreateExpenditurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [plan, setPlan] = useState('');
    const [evidenceDueAt, setEvidenceDueAt] = useState('');
    const [items, setItems] = useState<CreateExpenditureItemRequest[]>([
        { category: '', quantity: 1, price: 0, expectedPrice: 0, note: '' }
    ]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        if (!campaignId) {
            setError('Campaign ID is missing.');
            setLoading(false);
            return;
        }

        const fetchCampaign = async () => {
            try {
                setLoading(true);
                const data = await campaignService.getById(Number(campaignId));
                setCampaign(data);
            } catch (err) {
                console.error('Failed to fetch campaign:', err);
                setError('Failed to load campaign data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [campaignId, isAuthenticated, authLoading, router]);

    const handleItemChange = (index: number, field: keyof CreateExpenditureItemRequest, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { category: '', quantity: 1, price: 0, expectedPrice: 0, note: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.expectedPrice)), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignId) return;

        if (!plan.trim()) {
            alert('Vui lòng nhập mô tả/kế hoạch chi tiêu.');
            return;
        }

        if (items.some(item => !item.category || item.quantity <= 0 || item.price < 0)) {
            alert('Vui lòng kiểm tra lại thông tin các hạng mục (Tên, Số lượng > 0, Đơn giá >= 0).');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(evidenceDueAt);
        // User requested to allow current date
        if (selectedDate < today) {
            alert('Hạn nộp minh chứng không được là ngày trong quá khứ.');
            return;
        }

        try {
            setSubmitting(true);
            const payload: CreateExpenditureRequest = {
                campaignId: Number(campaignId),
                plan: plan,
                evidenceDueAt: evidenceDueAt ? new Date(evidenceDueAt).toISOString() : undefined,
                evidenceStatus: 'PENDING',
                items: items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                    price: 0, // Default Actual Price to 0
                    expectedPrice: Number(item.expectedPrice)
                }))
            };

            await expenditureService.create(payload);
            router.push(`/account/campaigns/expenditures?campaignId=${campaignId}`);
        } catch (err: any) {
            console.error('Failed to create expenditure:', err);
            // Try to extract error message from response
            const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo khoản chi.';
            alert(`Lỗi: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-600">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p>{error || 'Campaign not found'}</p>
                <Link href="/account/campaigns" className="mt-4 inline-block text-orange-600 font-medium">
                    Quay lại danh sách chiến dịch
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link
                        href={`/account/campaigns/expenditures?campaignId=${campaignId}`}
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chi tiêu
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tạo khoản chi tiêu mới</h1>
                    <p className="mt-2 text-gray-600">
                        Chiến dịch: <span className="font-semibold text-orange-600">{campaign.title}</span>
                    </p>
                </div>

                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Lưu ý quan trọng</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Nếu giá thị trường thay đổi, chi tiêu <strong>không được vượt quá</strong> số tiền quyên góp cho từng mục.
                                    Vui lòng cân nhắc kỹ lưỡng khi lập kế hoạch.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-900">Thông tin chung</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                Mô tả / Kế hoạch chi tiêu <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="plan"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                                placeholder="Ví dụ: Mua 500 thùng mì tôm cứu trợ đợt 1..."
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="evidenceDueAt" className="block text-sm font-medium text-gray-700">
                                Hạn nộp minh chứng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="evidenceDueAt"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2 mt-1"
                                value={evidenceDueAt}
                                onChange={(e) => setEvidenceDueAt(e.target.value)}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">Ngày bắt buộc phải cung cấp hóa đơn/chứng từ.</p>
                        </div>
                    </div>

                    <div className="p-6 border-t border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Chi tiết hạng mục</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Thêm hạng mục
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tên hàng hóa / Dịch vụ</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                                            placeholder="Tên sản phẩm..."
                                            value={item.category}
                                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-24">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">SL Dự Kiến</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Giá Dự Kiến (VNĐ)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                                            value={item.expectedPrice}
                                            onChange={(e) => handleItemChange(index, 'expectedPrice', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {/* Actual Price hidden for creation */}
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                                            placeholder="Ghi chú..."
                                            value={item.note || ''}
                                            onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center pb-2">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            className={`p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors ${items.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Xóa hạng mục này"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end items-center text-xl font-bold text-gray-900 border-t pt-4">
                            <span>Tổng cộng:</span>
                            <span className="ml-4 text-orange-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <Link
                            href={`/account/campaigns/expenditures?campaignId=${campaignId}`}
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Hủy bỏ
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Lưu khoản chi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
