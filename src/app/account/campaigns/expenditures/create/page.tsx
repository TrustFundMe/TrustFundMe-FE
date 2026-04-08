'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { bankAccountService } from '@/services/bankAccountService';
import { CampaignDto } from '@/types/campaign';
import { BankAccountDto } from '@/types/bankAccount';
import { CreateExpenditureRequest, CreateExpenditureItemRequest } from '@/types/expenditure';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, CreditCard, ExternalLink, Upload, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

export default function CreateExpenditurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [primaryBank, setPrimaryBank] = useState<BankAccountDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [plan, setPlan] = useState('Chi tiêu đợt 1');
    const [evidenceDueAt, setEvidenceDueAt] = useState('');
    const [items, setItems] = useState<CreateExpenditureItemRequest[]>([
        { category: '', quantity: 1, price: 0, expectedPrice: 0, note: '' }
    ]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importPreview, setImportPreview] = useState<CreateExpenditureItemRequest[] | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        if (!campaignId) {
            setError('Thiếu mã chiến dịch.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [campaignData, bankAccounts] = await Promise.all([
                    campaignService.getById(Number(campaignId)),
                    bankAccountService.getMyBankAccounts()
                ]);

                if (campaignData.status === 'DISABLED') {
                    setError('Chiến dịch này đã bị vô hiệu hóa. Bạn không thể tạo mới khoản chi tiêu.');
                    setLoading(false);
                    return;
                }

                setCampaign(campaignData);

                // Prioritize approved bank accounts, then fall back to any available
                const approvedBank = bankAccounts.find(acc => acc.status === 'APPROVED');
                const anyBank = bankAccounts.length > 0 ? bankAccounts[0] : null;
                setPrimaryBank(approvedBank || anyBank || null);
            } catch (err) {
                console.error('Không thể tải dữ liệu:', err);
                setError('Không thể tải dữ liệu chiến dịch hoặc ngân hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, isAuthenticated, authLoading, router]);

    // ── Excel Import / Export ──────────────────────────────────────────────────

    const handleDownloadTemplate = () => {
        try {
            const sampleData = [
                { 'STT': 1, 'Tên hàng hóa / Dịch vụ': 'Thùng mì tôm', 'Số lượng dự kiến': 100, 'Đơn giá dự kiến (VNĐ)': 7000, 'Thành tiền dự kiến (VNĐ)': 700000, 'Ghi chú': 'Mua tại siêu thị Co.opmart' },
                { 'STT': 2, 'Tên hàng hóa / Dịch vụ': 'Nước đóng chai (lốc 6 chai)', 'Số lượng dự kiến': 50, 'Đơn giá dự kiến (VNĐ)': 18000, 'Thành tiền dự kiến (VNĐ)': 900000, 'Ghi chú': 'Nước suối bidrico 1500ml' },
                { 'STT': 3, 'Tên hàng hóa / Dịch vụ': 'Gạo (kg)', 'Số lượng dự kiến': 200, 'Đơn giá dự kiến (VNĐ)': 25000, 'Thành tiền dự kiến (VNĐ)': 5000000, 'Ghi chú': 'Gạo ST25 Việt Nam' },
            ];
            const ws = XLSX.utils.json_to_sheet(sampleData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'KhoanChi');
            const colWidths = [
                { wch: 5 },
                { wch: 30 },
                { wch: 15 },
                { wch: 20 },
                { wch: 20 },
                { wch: 25 },
            ];
            ws['!cols'] = colWidths;
            const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '');
            XLSX.writeFile(wb, `KhoanChi_Mau_${today}.xlsx`);
            toast.success('Đã tải file mẫu thành công!');
        } catch {
            toast.error('Không thể tải file mẫu');
        }
    };

    const handleExportItems = () => {
        if (items.length === 0) {
            toast.error('Không có hạng mục nào để xuất');
            return;
        }
        try {
            const data = items.map((item, idx) => ({
                'STT': idx + 1,
                'Tên hàng hóa / Dịch vụ': item.category || '',
                'Số lượng dự kiến': Number(item.quantity) || 0,
                'Đơn giá dự kiến (VNĐ)': Number(item.expectedPrice) || 0,
                'Thành tiền dự kiến (VNĐ)': (Number(item.quantity) || 0) * (Number(item.expectedPrice) || 0),
                'Ghi chú': item.note || '',
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'KhoanChi');
            // Auto-size columns
            const colWidths = [
                { wch: 5 },  // STT
                { wch: 30 }, // Tên
                { wch: 15 }, // SL
                { wch: 20 }, // Đơn giá
                { wch: 20 }, // Thành tiền
                { wch: 25 }, // Ghi chú
            ];
            ws['!cols'] = colWidths;
            const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '');
            XLSX.writeFile(wb, `KhoanChi_${today}.xlsx`);
            toast.success('Đã xuất Excel thành công!');
        } catch {
            toast.error('Không thể xuất file Excel');
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const result = await expenditureService.importItemsFromExcel(file);
            if (!result.success || !result.data) {
                toast.error(result.error || 'Không thể đọc file Excel');
                return;
            }

            // ── Validate items ────────────────────────────────────────────────
            const errors: string[] = [];
            result.data.forEach((item, idx) => {
                const row = idx + 1;
                const errs: string[] = [];

                // Tên hàng hóa
                if (!item.category || item.category.trim() === '') {
                    errs.push(`Dòng ${row}: Thiếu tên hàng hóa / dịch vụ`);
                }

                // Số lượng
                const qty = Number(item.quantity);
                if (item.quantity === undefined || item.quantity === null || isNaN(qty)) {
                    errs.push(`Dòng ${row}: Thiếu số lượng`);
                } else if (qty <= 0) {
                    errs.push(`Dòng ${row}: Số lượng phải lớn hơn 0`);
                } else if (!Number.isInteger(qty)) {
                    errs.push(`Dòng ${row}: Số lượng phải là số nguyên`);
                }

                // Đơn giá
                const price = Number(item.expectedPrice);
                if (item.expectedPrice === undefined || item.expectedPrice === null || isNaN(price)) {
                    errs.push(`Dòng ${row}: Thiếu đơn giá dự kiến`);
                } else if (price < 0) {
                    errs.push(`Dòng ${row}: Đơn giá không được nhỏ hơn 0`);
                }

                errors.push(...errs);
            });

            if (errors.length > 0) {
                toast.error('File Excel có lỗi:\n' + errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n...và ${errors.length - 10} lỗi khác` : ''), { duration: 8000 });
                return;
            }

            // Tất cả hợp lệ → hiển thị preview
            setImportPreview(result.data);
            setShowImportModal(true);
        } catch {
            toast.error('Lỗi khi nhập file Excel');
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const handleApplyImport = () => {
        if (!importPreview || importPreview.length === 0) return;
        // Merge: thay thế items hiện tại bằng dữ liệu từ file
        const normalized = importPreview.map(item => ({
            ...item,
            price: 0,
            expectedPrice: item.expectedPrice,
            quantity: item.quantity,
        }));
        setItems(normalized);
        setShowImportModal(false);
        setImportPreview(null);
        toast.success(`Đã áp dụng ${normalized.length} hạng mục từ file Excel`);
    };

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

        if (campaign?.status === 'DISABLED') {
            toast.error('Chiến dịch đã bị vô hiệu hóa. Không thể thực hiện thao tác này.');
            return;
        }

        if (!plan.trim()) {
            toast.error('Vui lòng nhập mô tả/kế hoạch chi tiêu.');
            return;
        }

        if (items.some(item => !item.category || item.quantity <= 0 || item.price < 0)) {
            toast.error('Vui lòng kiểm tra lại thông tin các hạng mục (Tên, Số lượng > 0, Đơn giá >= 0).');
            return;
        }

        const isAuthorized = campaign?.type === 'AUTHORIZED';
        const totalAmount = calculateTotal();

        if (isAuthorized) {
            if (!evidenceDueAt) {
                toast.error('Vui lòng chọn hạn nộp minh chứng cho loại chiến dịch này.');
                return;
            }
            if (totalAmount > (campaign?.balance || 0)) {
                toast.error('Tổng số tiền chi tiêu dự kiến không được vượt quá số dư quỹ hiện tại.');
                return;
            }
        }

        if (evidenceDueAt) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(evidenceDueAt);
            if (selectedDate < today) {
                toast.error('Hạn nộp minh chứng không được là ngày trong quá khứ.');
                return;
            }
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
            console.error('Không thể tạo khoản chi:', err);
            // Try to extract error message from response
            const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo khoản chi.';
            toast.error(`Lỗi: ${msg}`);
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
                <p>{error || 'Không tìm thấy chiến dịch'}</p>
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
                        {campaign.type === 'AUTHORIZED' && (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-sm font-medium text-orange-800">Số dư quỹ hiện tại</p>
                                    <p className="text-xs text-orange-600 italic">Số tiền thực tế cộng dồn từ các đợt donate</p>
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign.balance)}
                                </div>
                            </div>
                        )}

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

                        {campaign.type === 'AUTHORIZED' && (
                            <div>
                                <label htmlFor="evidenceDueAt" className="block text-sm font-medium text-gray-700">
                                    Hạn nộp minh chứng <span className="text-red-500">*</span>
                                </label>
                                <DatePicker
                                    id="evidenceDueAt"
                                    selected={evidenceDueAt ? new Date(evidenceDueAt) : null}
                                    onChange={(date: Date | null) => setEvidenceDueAt(date ? date.toISOString() : '')}
                                    locale={vi}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2 mt-1"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">Ngày bắt buộc phải cung cấp hóa đơn/chứng từ cho kế hoạch này.</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thông tin tài khoản thụ hưởng
                            </label>
                            {primaryBank ? (
                                <div className={`rounded-xl border p-4 flex items-center justify-between ${primaryBank.status === 'APPROVED'
                                    ? 'bg-green-50 border-green-200'
                                    : primaryBank.status === 'REJECTED'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-yellow-50 border-yellow-200'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${primaryBank.status === 'APPROVED'
                                            ? 'bg-green-100 text-green-600'
                                            : primaryBank.status === 'REJECTED'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900">{primaryBank.bankCode} - {primaryBank.accountNumber}</p>
                                                {primaryBank.status === 'APPROVED' ? (
                                                    <span className="px-1.5 py-0.5 rounded bg-green-500 text-[8px] font-black text-white uppercase tracking-wider leading-none">Vượt qua xét duyệt</span>
                                                ) : primaryBank.status === 'REJECTED' ? (
                                                    <span className="px-1.5 py-0.5 rounded bg-red-500 text-[8px] font-black text-white uppercase tracking-wider leading-none">Bị từ chối</span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-[8px] font-black text-white uppercase tracking-wider leading-none">Đang chờ duyệt</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium uppercase">{primaryBank.accountHolderName}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/account/profile"
                                        className={`text-xs font-bold flex items-center gap-1 ${primaryBank.status === 'APPROVED' ? 'text-green-700 hover:text-green-800' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {primaryBank.status === 'REJECTED' ? 'Sửa lại' : 'Thay đổi'} <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                            <AlertCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-red-900">Chưa cấu hình tài khoản ngân hàng</p>
                                            <p className="text-xs text-red-500">Bạn cần cập nhật tài khoản đã xác thực để nhận tiền giải ngân.</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/account/profile"
                                        className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 underline"
                                    >
                                        Cập nhật ngay
                                    </Link>
                                </div>
                            )}
                            <p className="mt-2 text-[10px] text-gray-400 italic">
                                * Thông tin ngân hàng tại thời điểm lưu sẽ được ghi lại vĩnh viễn trong chứng từ chi tiêu này.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 border-t border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Chi tiết hạng mục</h2>
                        <div className="flex items-center gap-2">
                            {/* Nút Tải mẫu */}
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                title="Tải file mẫu Excel"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-1" /> Tải mẫu
                            </button>

                            {/* Nút Xuất Excel */}
                            <button
                                type="button"
                                onClick={handleExportItems}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                title="Xuất Excel hạng mục"
                            >
                                <Download className="w-4 h-4 mr-1" /> Xuất Excel
                            </button>

                            {/* Nút Nhập Excel */}
                            <label className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                                {importing ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                ) : (
                                    <Upload className="w-4 h-4 mr-1" />
                                )} Nhập Excel
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={handleImportFile}
                                />
                            </label>

                            {/* Nút Thêm hạng mục thủ công */}
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Thêm hạng mục
                            </button>
                        </div>
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
                                            step="1"
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

                {/* Modal xem trước khi nhập Excel */}
                {showImportModal && importPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900">Xem trước dữ liệu nhập từ Excel</h3>
                                <button
                                    onClick={() => { setShowImportModal(false); setImportPreview(null); }}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-4">
                                {importPreview.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Không tìm thấy hạng mục nào trong file.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-orange-50">
                                                <th className="px-3 py-2 text-left font-semibold">STT</th>
                                                <th className="px-3 py-2 text-left font-semibold">Tên hàng hóa / Dịch vụ</th>
                                                <th className="px-3 py-2 text-right font-semibold">Số lượng</th>
                                                <th className="px-3 py-2 text-right font-semibold">Đơn giá (VNĐ)</th>
                                                <th className="px-3 py-2 text-right font-semibold">Thành tiền (VNĐ)</th>
                                                <th className="px-3 py-2 text-left font-semibold">Ghi chú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {importPreview.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-3 py-2">{idx + 1}</td>
                                                    <td className="px-3 py-2 font-medium">{item.category || '(trống)'}</td>
                                                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        {new Intl.NumberFormat('vi-VN').format(Number(item.expectedPrice))}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold text-orange-600">
                                                        {new Intl.NumberFormat('vi-VN').format(
                                                            Number(item.quantity) * Number(item.expectedPrice)
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-500">{item.note || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50 font-bold">
                                                <td colSpan={4} className="px-3 py-2 text-right">Tổng cộng:</td>
                                                <td className="px-3 py-2 text-right text-orange-600">
                                                    {new Intl.NumberFormat('vi-VN').format(
                                                        importPreview.reduce((sum, item) =>
                                                            sum + Number(item.quantity) * Number(item.expectedPrice), 0)
                                                    )}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}
                            </div>
                            <div className="p-4 border-t flex justify-end gap-3">
                                <button
                                    onClick={() => { setShowImportModal(false); setImportPreview(null); }}
                                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleApplyImport}
                                    disabled={importPreview.length === 0}
                                    className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                >
                                    Áp dụng {importPreview.length} hạng mục
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
