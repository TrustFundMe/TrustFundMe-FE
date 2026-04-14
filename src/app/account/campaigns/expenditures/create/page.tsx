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

    const [plan, setPlan] = useState('Đang tải...');
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
                const [campaignData, bankAccounts, existingExpenditures] = await Promise.all([
                    campaignService.getById(Number(campaignId)),
                    bankAccountService.getMyBankAccounts(),
                    expenditureService.getByCampaignId(Number(campaignId))
                ]);

                if (campaignData.status === 'DISABLED') {
                    setError('Chiến dịch này đã bị vô hiệu hóa. Bạn không thể tạo mới khoản chi tiêu.');
                    setLoading(false);
                    return;
                }

                setCampaign(campaignData);
                
                // Set default plan name based on count
                const nextNumber = (existingExpenditures?.length || 0) + 1;
                setPlan(`Chi tiêu đợt ${nextNumber}`);

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

                // Tên hàng hóa: tối đa 50 ký tự
                if (item.category && item.category.trim().length > 50) {
                    errs.push(`Dòng ${row}: Tên hàng hóa không được vượt quá 50 ký tự`);
                }

                // Số lượng: tối đa 10.000
                if (qty > 10000) {
                    errs.push(`Dòng ${row}: Số lượng không được vượt quá 10.000`);
                }

                // Ghi chú: tối đa 100 ký tự
                if (item.note && item.note.trim().length > 100) {
                    errs.push(`Dòng ${row}: Ghi chú không được vượt quá 100 ký tự`);
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

        if (items.some(item => !item.category || item.quantity <= 0 || item.expectedPrice < 0)) {
            toast.error('Vui lòng kiểm tra lại thông tin các hạng mục (Tên, Số lượng > 0, Đơn giá >= 0).');
            return;
        }

        if (items.some(item => item.category.length > 50)) {
            toast.error('Tên hàng hóa / dịch vụ không được vượt quá 50 ký tự.');
            return;
        }
        if (items.some(item => Number(item.quantity) > 10000)) {
            toast.error('Số lượng dự kiến không được vượt quá 10.000.');
            return;
        }
        if (items.some(item => (item.note || '').length > 100)) {
            toast.error('Ghi chú không được vượt quá 100 ký tự.');
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
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 30);
            if (selectedDate > maxDate) {
                toast.error('Hạn nộp minh chứng không được quá 1 tháng kể từ ngày hôm nay.');
                return;
            }
        }

        try {
            setSubmitting(true);
            const payload: CreateExpenditureRequest = {
                campaignId: Number(campaignId),
                plan: plan,
                evidenceDueAt: evidenceDueAt ? new Date(evidenceDueAt).toISOString() : undefined,
                evidenceStatus: campaign?.type === 'ITEMIZED' ? 'PENDING_REVIEW' : 'PENDING',
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
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={`/account/campaigns/expenditures?campaignId=${campaignId}`}
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-3 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách chi tiêu
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Tạo khoản chi tiêu mới</h1>
                </div>

                {/* 2-column layout */}
                <div className="flex gap-6 items-start">

                    {/* ── LEFT COLUMN: Form ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-3">

                        {/* Plan + Evidence inputs */}
                        <div className="bg-white rounded p-3">
                            <div>
                                <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả / Kế hoạch chi tiêu <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="plan"
                                    rows={1}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-1.5"
                                    placeholder="Ví dụ: Mua 500 thùng mì tôm cứu trợ đợt 1..."
                                    value={plan}
                                    onChange={(e) => setPlan(e.target.value)}
                                    required
                                />
                            </div>

                            {campaign.type === 'AUTHORIZED' && (
                                <div className="mt-2">
                                    <label htmlFor="evidenceDueAt" className="block text-sm font-medium text-gray-700 mb-1">
                                        Hạn nộp minh chứng <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        id="evidenceDueAt"
                                        selected={evidenceDueAt ? new Date(evidenceDueAt) : null}
                                        onChange={(date: Date | null) => setEvidenceDueAt(date ? date.toISOString() : '')}
                                        locale={vi}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="dd/mm/yyyy"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-1.5"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Lưu ý quan trọng */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded-r-lg text-[11px] text-yellow-700">
                            ⚠️ Nếu giá thị trường thay đổi, chi tiêu <strong>không được vượt quá</strong> số tiền quyên góp cho từng mục.
                        </div>

                        {/* Items list */}
                        <div className="bg-white rounded flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                            {/* Items header */}
                            <div className="px-3 py-1.5 border-b border-gray-200 flex justify-between items-center shrink-0">
                                <h2 className="text-sm font-medium text-gray-900">Chi tiết</h2>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="inline-flex items-center px-2.5 py-1 border border-gray-300 text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500"
                                        title="Tải file mẫu Excel"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Tải mẫu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExportItems}
                                        className="inline-flex items-center px-2.5 py-1 border border-gray-300 text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500"
                                        title="Xuất Excel hạng mục"
                                    >
                                        <Download className="w-3.5 h-3.5 mr-1" /> Xuất Excel
                                    </button>
                                    <label className="inline-flex items-center px-2.5 py-1 border border-gray-300 text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500 cursor-pointer">
                                        {importing ? (
                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-400 mr-1"></div>
                                        ) : (
                                            <Upload className="w-3.5 h-3.5 mr-1 text-gray-500" />
                                        )} Nhập
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            className="hidden"
                                            onChange={handleImportFile}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Thêm
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable table */}
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-2 py-1.5 text-left text-sm font-bold text-gray-700 w-5">STT</th>
                                            <th className="px-2 py-1.5 text-left text-sm font-bold text-gray-700 w-44">Tên hàng hóa / Dịch vụ</th>
                                            <th className="px-2 py-1.5 text-right text-sm font-bold text-gray-700 w-16">SL Dự Kiến</th>
                                            <th className="px-2 py-1.5 text-right text-sm font-bold text-gray-700 w-24">Giá Dự Kiến (VNĐ)</th>
                                            <th className="px-2 py-1.5 text-right text-sm font-bold text-gray-700 w-24">Thành tiền (VNĐ)</th>
                                            <th className="px-2 py-1.5 text-left text-sm font-bold text-gray-700 w-28">Ghi chú</th>
                                            <th className="px-2 py-1.5 text-center text-sm font-bold text-gray-700 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="px-2 py-1 text-gray-400 text-center">{index + 1}</td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="text"
                                                        maxLength={50}
                                                        className="w-full rounded border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-1"
                                                        placeholder="Tên sản phẩm..."
                                                        value={item.category}
                                                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={10000}
                                                        className="w-full rounded border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-1 text-right"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        className="w-full rounded border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-1 text-right"
                                                        value={item.expectedPrice}
                                                        onChange={(e) => handleItemChange(index, 'expectedPrice', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="px-2 py-1 text-right font-semibold text-orange-600 text-sm">
                                                    {new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
                                                        Number(item.quantity) * Number(item.expectedPrice)
                                                    )}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="text"
                                                        maxLength={100}
                                                        className="w-full rounded border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-1"
                                                        placeholder="Ghi chú..."
                                                        value={item.note || ''}
                                                        onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        disabled={items.length === 1}
                                                        className={`p-1.5 rounded-full hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors ${items.length === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                        title="Xóa hạng mục"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Sticky footer */}
                            <div className="px-3 py-1.5 border-t border-gray-200 shrink-0">
                                <div className="flex justify-end items-center gap-2">
                                    <span className="text-sm font-bold text-gray-500">Tổng cộng:</span>
                                    <span className="text-lg font-bold text-orange-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
                                    </span>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <Link
                                        href={`/account/campaigns/expenditures?campaignId=${campaignId}`}
                                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                    >
                                        Hủy bỏ
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
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
                            </div>
                        </div>

                    </div>

                    {/* ── RIGHT COLUMN: Sidebar ── */}
                    <div className="w-80 shrink-0 flex flex-col gap-4">

                        {/* Chiến dịch */}
                        <div className="bg-white rounded p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Chiến dịch</p>
                            <p className="text-lg font-bold text-gray-900 mb-2 leading-snug">{campaign.title}</p>
                            {campaign.type === 'AUTHORIZED' && (
                                <span className="text-xs font-medium text-gray-600">Quỹ ủy quyền</span>
                            )}
                        </div>

                        {/* Số dư quỹ */}
                        {campaign.type === 'AUTHORIZED' && (
                            <div className="bg-white rounded p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Số dư quỹ hiện tại</p>
                                <div className="text-2xl font-bold text-orange-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign.balance)}
                                </div>
                                <p className="mt-1 text-xs text-gray-400 italic">Số tiền thực tế cộng dồn từ các đợt donate</p>
                            </div>
                        )}

                        {/* Bank Account */}
                        <div className="bg-white rounded p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Tài khoản thụ hưởng</p>
                            {primaryBank ? (
                                <div>
                                    <div className="rounded p-3 bg-gray-50 mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CreditCard className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-bold text-gray-900">{primaryBank.bankCode} - {primaryBank.accountNumber}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium uppercase ml-6">{primaryBank.accountHolderName}</p>
                                    </div>
                                    <div className="flex gap-1 flex-wrap items-center">
                                        <Link
                                            href="/account/profile"
                                            className="text-xs font-bold flex items-center gap-1 text-gray-500 hover:text-gray-700"
                                        >
                                            Thay đổi <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 rounded-lg border border-red-200 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-bold text-red-900">Chưa cấu hình</span>
                                    </div>
                                    <Link
                                        href="/account/profile"
                                        className="text-xs font-bold text-red-700 hover:text-red-800 underline"
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
                </div>

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
                                                <th className="px-3 py-2 text-left text-sm font-bold text-gray-700">STT</th>
                                                <th className="px-3 py-2 text-left text-sm font-bold text-gray-700">Tên hàng hóa / Dịch vụ</th>
                                                <th className="px-3 py-2 text-right text-sm font-bold text-gray-700">Số lượng</th>
                                                <th className="px-3 py-2 text-right text-sm font-bold text-gray-700">Đơn giá (VNĐ)</th>
                                                <th className="px-3 py-2 text-right text-sm font-bold text-gray-700">Thành tiền (VNĐ)</th>
                                                <th className="px-3 py-2 text-left text-sm font-bold text-gray-700">Ghi chú</th>
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
