'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { ArrowLeft, Calendar, FileText, CheckCircle, AlertCircle, Clock, Receipt } from 'lucide-react';

export default function ExpenditureDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
    const [items, setItems] = useState<ExpenditureItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateItems, setUpdateItems] = useState<{ id: number; actualQuantity: number; price: number; }[]>([]);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const expData = await expenditureService.getById(id);
                setExpenditure(expData);

                const itemsData = await expenditureService.getItems(id);
                setItems(itemsData);

                // Initialize update items
                setUpdateItems(itemsData.map(item => ({
                    id: item.id,
                    actualQuantity: item.actualQuantity || 0,
                    price: item.price || 0
                })));
            } catch (err) {
                console.error('Failed to fetch details:', err);
                setError('Failed to load expenditure details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated, authLoading, router]);

    const handleOpenUpdateModal = () => {
        if (items.length > 0) {
            setUpdateItems(items.map(item => ({
                id: item.id,
                actualQuantity: item.actualQuantity !== undefined ? item.actualQuantity : 0, // Default to 0 if null
                price: item.price !== undefined ? item.price : 0 // Default to 0 if null
            })));
        }
        setIsUpdateModalOpen(true);
    };

    const handleUpdateItemChange = (index: number, field: 'actualQuantity' | 'price', value: string) => {
        const newItems = [...updateItems];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setUpdateItems(newItems);
    };

    const handleUpdateSubmit = async () => {
        try {
            setUpdating(true);
            await expenditureService.updateActuals(id, updateItems);

            // Refresh data
            const expData = await expenditureService.getById(id);
            setExpenditure(expData);
            const itemsData = await expenditureService.getItems(id);
            setItems(itemsData);

            setIsUpdateModalOpen(false);
            alert('Cập nhật thành công!');
        } catch (err) {
            console.error('Update failed:', err);
            alert('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1.5" /> Đã duyệt</span>;
            case 'PENDING':
            case 'PENDING_REVIEW':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Clock className="w-4 h-4 mr-1.5" /> Chờ duyệt</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><AlertCircle className="w-4 h-4 mr-1.5" /> Từ chối</span>;
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (error || !expenditure) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-600">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p>{error || 'Expenditure not found'}</p>
                <Link href="/account/campaigns" className="mt-4 inline-block text-orange-600 font-medium">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={`/account/campaigns/expenditures?campaignId=${expenditure.campaignId}`}
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chi tiêu
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                Chi tiết khoản chi #{expenditure.id}
                                {getStatusBadge(expenditure.status)}
                            </h1>
                            <p className="mt-2 text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ngày tạo: {expenditure.createdAt ? new Date(expenditure.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                            <button
                                onClick={handleOpenUpdateModal}
                                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors"
                            >
                                <FileText className="w-4 h-4 mr-1.5" /> Cập nhật Thực tế
                            </button>
                        </div>
                    </div>

                    {/* 3-Frame Summary Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Frame 1: Planned / Call */}
                        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                            <p className="text-sm font-medium text-blue-600 mb-1 uppercase tracking-wide">Kế hoạch / Kêu gọi</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expenditure.totalExpectedAmount || 0)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Ngân sách dự kiến ban đầu</p>
                        </div>

                        {/* Frame 2: Received / Donated */}
                        <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-green-100 rounded-full opacity-50"></div>
                            <p className="text-sm font-medium text-green-600 mb-1 uppercase tracking-wide">Đã Nhận / Donate</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                            </p>
                            <p className="text-xs text-green-600 mt-1 font-medium">(Đang cập nhật từ hệ thống Donate)</p>
                        </div>

                        {/* Frame 3: Actual Spent */}
                        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm">
                            <p className="text-sm font-medium text-orange-600 mb-1 uppercase tracking-wide">Thực tế chi</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expenditure.totalAmount)}
                            </p>
                            {expenditure.variance !== undefined && (
                                <p className={`text-xs mt-1 font-medium ${0 - expenditure.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {0 - expenditure.totalAmount >= 0 ? 'Dư: ' : 'Thiếu: '}
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(0 - expenditure.totalAmount))}
                                    {' '}(so với Đã nhận)
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        {/* Plan/Description */}
                        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                                Mô tả / Kế hoạch
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{expenditure.plan || 'Không có mô tả'}</p>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Receipt className="w-5 h-5 mr-2 text-gray-400" />
                                    Danh sách hạng mục ({items.length})
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên hàng hóa</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">Kế hoạch</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider bg-green-50">Đã nhận</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-orange-600 uppercase tracking-wider bg-orange-50">Thực tế</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.category}</div>
                                                    {item.note && <div className="text-xs text-gray-500 mt-1">{item.note}</div>}
                                                </td>
                                                {/* Plan Column */}
                                                <td className="px-6 py-4 text-right bg-blue-50/30">
                                                    <div className="text-sm font-bold text-blue-700">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.quantity || 0) * (item.expectedPrice || 0))}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}
                                                    </div>
                                                </td>
                                                {/* Donated Column */}
                                                <td className="px-6 py-4 text-right bg-green-50/30">
                                                    <div className="text-sm font-bold text-green-700">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1 italic">
                                                        (Chưa có dữ liệu)
                                                    </div>
                                                </td>
                                                {/* Actual Column */}
                                                <td className="px-6 py-4 text-right bg-orange-50/30">
                                                    <div className="text-sm font-bold text-orange-700">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.actualQuantity || 0) * item.price)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.actualQuantity || 0} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 space-y-6">
                        {/* Evidence Info */}
                        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin minh chứng</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Trạng thái minh chứng</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {expenditure.evidenceStatus || 'Chưa cập nhật'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Hạn nộp dự kiến</p>
                                    <p className="text-sm font-medium text-gray-900 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {expenditure.evidenceDueAt ? new Date(expenditure.evidenceDueAt).toLocaleDateString() : 'Chưa đặt hạn'}
                                    </p>
                                </div>
                            </div>

                            {/* TODO: Add logic/button to upload evidence here */}
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <button disabled className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed">
                                    Cập nhật minh chứng (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Update Modal */}
            {
                isUpdateModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsUpdateModalOpen(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                                                Cập nhật Thực tế Chi tiêu
                                            </h3>

                                            {/* Summary items for Modal */}
                                            <div className="mb-4 flex flex-wrap gap-4 text-sm">
                                                <div className="bg-green-50 px-3 py-2 rounded border border-green-200">
                                                    <span className="text-green-800 font-medium">Tổng Đã nhận:</span>{' '}
                                                    <span className="font-bold text-green-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}</span>
                                                </div>
                                                <div className={`px-3 py-2 rounded border ${updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                                    <span className={`${updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > 0 ? 'text-red-800' : 'text-gray-800'} font-medium`}>Tổng Thực tế đang nhập:</span>{' '}
                                                    <span className={`font-bold ${updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0))}
                                                    </span>
                                                </div>
                                            </div>

                                            {updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > 0 && (
                                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    Tổng chi thực tế ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0))})
                                                    vượt quá số tiền đã nhận (0đ). Bạn không thể lưu.
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hàng hóa</th>
                                                                <th className="px-4 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">Kế hoạch</th>
                                                                <th className="px-4 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider bg-green-50">Đã nhận</th>
                                                                <th className="px-4 py-3 text-center text-xs font-medium text-orange-600 uppercase tracking-wider bg-orange-50">Thực tế (Nhập liệu)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {items.map((item, index) => (
                                                                <tr key={item.id}>
                                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                                        <div className="font-medium">{item.category}</div>
                                                                        {item.note && <div className="text-xs text-gray-500">{item.note}</div>}
                                                                    </td>

                                                                    {/* Plan Info */}
                                                                    <td className="px-4 py-3 text-right text-sm text-gray-500 bg-blue-50/30">
                                                                        <div className="font-medium text-blue-700">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * (item.expectedPrice || 0))}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.expectedPrice || 0)}
                                                                        </div>
                                                                    </td>

                                                                    {/* Donated Info - 0 for now */}
                                                                    <td className="px-4 py-3 text-right text-sm text-gray-500 bg-green-50/30">
                                                                        <div className="font-medium text-green-700">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
                                                                        </div>
                                                                    </td>

                                                                    {/* Actual Input */}
                                                                    <td className="px-4 py-3 bg-orange-50/30">
                                                                        <div className="flex flex-col gap-2">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <label className="text-xs text-gray-500">SL:</label>
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-right"
                                                                                    placeholder="SL"
                                                                                    value={updateItems[index]?.actualQuantity}
                                                                                    onChange={(e) => handleUpdateItemChange(index, 'actualQuantity', e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <label className="text-xs text-gray-500">ĐG:</label>
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="1000"
                                                                                    className="w-28 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-right"
                                                                                    placeholder="Đơn giá"
                                                                                    value={updateItems[index]?.price}
                                                                                    onChange={(e) => handleUpdateItemChange(index, 'price', e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="text-right pt-1 border-t border-orange-200">
                                                                                <div className="text-xs text-gray-500">Thành tiền:</div>
                                                                                <div className="font-bold text-orange-700">
                                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((updateItems[index]?.actualQuantity || 0) * (updateItems[index]?.price || 0))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleUpdateSubmit}
                                        disabled={updating || updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > 0 /* Block if > 0 (Donated) */}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${updating || updateItems.reduce((sum, item) => sum + (item.actualQuantity * item.price), 0) > 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-orange-600 hover:bg-orange-700'
                                            }`}
                                    >
                                        {updating ? 'Đang lưu...' : 'Lưu cập nhật'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsUpdateModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
