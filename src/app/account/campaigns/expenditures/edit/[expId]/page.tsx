'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { bankAccountService } from '@/services/bankAccountService';
import { CampaignDto } from '@/types/campaign';
import { BankAccountDto } from '@/types/bankAccount';
import { Expenditure, CreateExpenditureRequest, CreateExpenditureItemRequest, CreateExpenditureCatologyRequest } from '@/types/expenditure';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, CreditCard, ExternalLink, Upload, Download, FileSpreadsheet, ChevronDown, ChevronRight, FolderPlus, X, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

export default function EditExpenditurePage({ params }: { params: Promise<{ expId: string }> }) {
    const { expId } = use(params);

    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        }>
            <EditExpenditureContent expId={expId} />
        </Suspense>
    );
}

function EditExpenditureContent({ expId }: { expId: string }) {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
    const [originalTotal, setOriginalTotal] = useState<number>(0);
    const [primaryBank, setPrimaryBank] = useState<BankAccountDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [plan, setPlan] = useState('');
    const [evidenceDueAt, setEvidenceDueAt] = useState('');

    interface CategoryState extends CreateExpenditureCatologyRequest {
        collapsed: boolean;
    }
    const [categories, setCategories] = useState<CategoryState[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const expData = await expenditureService.getById(expId);
                setExpenditure(expData);
                setPlan(expData.plan || '');
                setEvidenceDueAt(expData.evidenceDueAt || '');

                const [campaignData, bankAccounts, catsData] = await Promise.all([
                    campaignService.getById(expData.campaignId),
                    bankAccountService.getMyBankAccounts(),
                    expenditureService.getCategories(expId)
                ]);

                if (campaignData.status === 'DISABLED') {
                    setError('Chiến dịch này đã bị vô hiệu hóa. Bạn không thể chỉnh sửa khoản chi tiêu.');
                    setLoading(false);
                    return;
                }

                setCampaign(campaignData);

                // Map categories and items
                if (catsData && catsData.length > 0) {
                    const mappedCats = catsData.map(c => ({
                        name: c.name,
                        description: c.description || '',
                        withdrawalCondition: c.withdrawalCondition || '',
                        collapsed: false,
                        items: c.items.map(i => ({
                            name: i.name,
                            expectedPurchaseLink: i.expectedPurchaseLink || '',
                            expectedQuantity: i.expectedQuantity || 0,
                            expectedPrice: i.expectedPrice || 0,
                            expectedNote: i.expectedNote || '',
                            expectedBrand: i.expectedBrand || '',
                            expectedUnit: i.expectedUnit || '',
                            expectedPurchaseLocation: i.expectedPurchaseLocation || ''
                        }))
                    }));
                    setCategories(mappedCats);

                    // Calculate original total
                    const total = mappedCats.reduce((sum, cat) =>
                        sum + cat.items.reduce((cSum, item) => cSum + (Number(item.expectedQuantity) * Number(item.expectedPrice)), 0)
                        , 0);
                    setOriginalTotal(total);
                } else if (expData.items && expData.items.length > 0) {
                    // Fallback if no categories
                    const fallbackCats = [{
                        name: 'Mặc định',
                        description: '',
                        withdrawalCondition: '',
                        collapsed: false,
                        items: expData.items.map(i => ({
                            name: i.name,
                            expectedPurchaseLink: i.expectedPurchaseLink || '',
                            expectedQuantity: i.expectedQuantity || 0,
                            expectedPrice: i.expectedPrice || 0,
                            expectedNote: i.expectedNote || '',
                            expectedBrand: i.expectedBrand || '',
                            expectedUnit: i.expectedUnit || '',
                            expectedPurchaseLocation: i.expectedPurchaseLocation || ''
                        }))
                    }];
                    setCategories(fallbackCats);

                    const total = fallbackCats.reduce((sum, cat) =>
                        sum + cat.items.reduce((cSum, item) => cSum + (Number(item.expectedQuantity) * Number(item.expectedPrice)), 0)
                        , 0);
                    setOriginalTotal(total);
                } else {
                    setCategories([{ name: '', description: '', withdrawalCondition: '', items: [{ name: '', expectedPurchaseLink: '', expectedQuantity: 1, expectedPrice: 0, expectedNote: '' }], collapsed: false }]);
                    setOriginalTotal(0);
                }

                const approvedBank = bankAccounts.find(acc => acc.status === 'APPROVED');
                const anyBank = bankAccounts.length > 0 ? bankAccounts[0] : null;
                setPrimaryBank(approvedBank || anyBank || null);
            } catch (err) {
                console.error('Không thể tải dữ liệu:', err);
                setError('Không thể tải dữ liệu chi tiêu.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [expId, isAuthenticated, authLoading, router]);

    // Reuse Excel helpers from create page
    const handleDownloadTemplate = () => { /* ... similar logic ... */ };
    const handleExportItems = () => { /* ... similar logic ... */ };
    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => { /* ... similar logic ... */ };

    const addCategory = () => setCategories([...categories, { name: '', description: '', withdrawalCondition: '', items: [{ name: '', expectedPurchaseLink: '', expectedQuantity: 1, expectedPrice: 0, expectedNote: '' }], collapsed: false }]);
    const removeCategory = (idx: number) => categories.length > 1 && setCategories(categories.filter((_, i) => i !== idx));
    const updateCategory = (idx: number, field: string, value: string) => {
        const next = [...categories];
        next[idx] = { ...next[idx], [field]: value };
        setCategories(next);
    };
    const toggleCategory = (idx: number) => {
        const next = [...categories];
        next[idx] = { ...next[idx], collapsed: !next[idx].collapsed };
        setCategories(next);
    };

    const handleItemChange = (catIdx: number, itemIdx: number, field: keyof CreateExpenditureItemRequest, value: any) => {
        const next = [...categories];
        const items = [...next[catIdx].items];
        items[itemIdx] = { ...items[itemIdx], [field]: value };
        next[catIdx] = { ...next[catIdx], items };
        setCategories(next);
    };
    const addItem = (catIdx: number) => {
        const next = [...categories];
        next[catIdx].items.push({ name: '', expectedPurchaseLink: '', expectedQuantity: 1, expectedPrice: 0, expectedNote: '' });
        setCategories(next);
    };
    const removeItem = (catIdx: number, itemIdx: number) => {
        const next = [...categories];
        if (next[catIdx].items.length > 1) {
            next[catIdx].items = next[catIdx].items.filter((_, i) => i !== itemIdx);
            setCategories(next);
        }
    };

    const calculateTotal = () => categories.reduce((s, c) => s + c.items.reduce((ss, i) => ss + (Number(i.expectedQuantity) * Number(i.expectedPrice)), 0), 0);
    const calculateCategoryTotal = (idx: number) => categories[idx].items.reduce((s, i) => s + (Number(i.expectedQuantity) * Number(i.expectedPrice)), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenditure || submitting) return;

        // Validations
        if (!plan.trim()) { toast.error('Vui lòng nhập kế hoạch'); return; }
        if (categories.some(c => !c.name.trim())) { toast.error('Vui lòng nhập tên danh mục'); return; }

        if (campaign?.type === 'AUTHORIZED' && !evidenceDueAt) { toast.error('Vui lòng chọn hạn nộp minh chứng'); return; }

        try {
            const currentTotal = calculateTotal();
            if (currentTotal !== originalTotal) {
                toast.error(`Tổng số tiền (${new Intl.NumberFormat('vi-VN').format(currentTotal)}đ) phải bằng với số tiền ban đầu (${new Intl.NumberFormat('vi-VN').format(originalTotal)}đ)`);
                return;
            }

            setSubmitting(true);
            const payload: CreateExpenditureRequest = {
                campaignId: expenditure.campaignId,
                plan,
                categories: categories.map(c => ({
                    name: c.name,
                    description: c.description,
                    withdrawalCondition: c.withdrawalCondition,
                    items: c.items.map(i => ({
                        ...i,
                        expectedQuantity: Number(i.expectedQuantity),
                        expectedPrice: Number(i.expectedPrice)
                    }))
                }))
            };

            await expenditureService.update(expId, payload);
            toast.success('Đã cập nhật và gửi lại xét duyệt');
            router.push(`/account/campaigns/expenditures?campaignId=${expenditure.campaignId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full" /></div>;
    if (error || !campaign) return <div className="p-10 text-center text-red-500">{error || 'Không tìm thấy dữ liệu'}</div>;

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
            {/* Header / Navigation */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href={`/account/campaigns/expenditures?campaignId=${campaign.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Chỉnh sửa chi tiêu</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{campaign.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-right mr-4 hidden md:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngân sách quỹ</p>
                        <p className="text-sm font-black text-emerald-600">{new Intl.NumberFormat('vi-VN').format(campaign.balance || 0)} đ</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2.5 bg-[#ff5e14] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#e05313] transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting ? '...' : <><Save className="w-4 h-4" /> GỬI LẠI</>}
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr,340px] p-4 gap-4">
                {/* Left Column: Editor content */}
                <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Mô tả / Kế hoạch chi tiêu</label>
                        <textarea
                            className="w-full rounded-xl border-gray-100 focus:ring-orange-500 focus:border-orange-500 text-sm font-bold p-3 bg-gray-50/50 border transition-all resize-none leading-relaxed"
                            rows={3}
                            value={plan}
                            onChange={e => setPlan(e.target.value)}
                            placeholder="Nhập mô tả chi tiết cho đợt chi tiêu này..."
                        />
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Bảng kê chi tiết</h2>
                        <button onClick={addCategory} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase hover:bg-orange-100 transition-all border border-orange-100">
                            <FolderPlus className="w-3.5 h-3.5" /> Thêm danh mục
                        </button>
                    </div>

                    <div className="space-y-4 pb-20">
                        {categories.map((cat, cIdx) => (
                            <div key={cIdx} className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden transition-all duration-300">
                                <div
                                    className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${cat.collapsed ? 'bg-white' : 'bg-gray-50'}`}
                                    onClick={() => toggleCategory(cIdx)}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
                                            {cat.collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <input
                                                className="bg-transparent border-none focus:ring-0 text-xs font-black text-gray-900 uppercase p-0 flex-1 min-w-[200px]"
                                                value={cat.name}
                                                onChange={e => { e.stopPropagation(); updateCategory(cIdx, 'name', e.target.value); }}
                                                onClick={e => e.stopPropagation()}
                                                placeholder="Tên danh mục (ví dụ: Vật liệu xây dựng...)"
                                            />
                                            <div className="h-4 w-px bg-gray-200" />
                                            <span className="text-xs font-black text-orange-600 tabular-nums">
                                                {new Intl.NumberFormat('vi-VN').format(calculateCategoryTotal(cIdx))} đ
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button onClick={e => { e.stopPropagation(); addItem(cIdx); }} className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors bg-white rounded-lg border border-gray-100 shadow-sm" title="Thêm hạng mục"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                {!cat.collapsed && (
                                    <div className="p-0 border-t border-gray-100">
                                        <div className="max-h-[400px] overflow-y-auto overflow-x-auto bg-white custom-scrollbar">
                                            <table className="w-full table-auto min-w-[1200px]">
                                                <thead className="sticky top-0 bg-gray-50 z-[5] shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest w-[180px]">Hàng hóa / Dịch vụ</th>
                                                        <th className="px-2 py-2 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest w-[80px]">Đơn vị</th>
                                                        <th className="px-2 py-2 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest w-[100px]">Nhãn hàng</th>
                                                        <th className="px-2 py-2 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest w-[80px]">SL</th>
                                                        <th className="px-2 py-2 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest w-[120px]">Đơn giá</th>
                                                        <th className="px-2 py-2 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest w-[130px]">Thành tiền</th>
                                                        <th className="px-3 py-2 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest w-[150px]">Địa điểm mua</th>
                                                        <th className="px-3 py-2 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest w-[150px]">Link tham khảo</th>
                                                        <th className="px-3 py-2 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest min-w-[150px]">Ghi chú</th>
                                                        <th className="px-2 py-2 w-[40px] text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {cat.items.map((item, iIdx) => (
                                                        <tr key={iIdx} className="hover:bg-gray-50/50 transition-colors group align-top">
                                                            <td className="p-2 px-3">
                                                                <input
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-bold p-2 text-gray-800 placeholder:text-gray-300"
                                                                    value={item.name}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'name', e.target.value)}
                                                                    placeholder="Tên sản phẩm/dịch vụ..."
                                                                />
                                                            </td>
                                                            <td className="p-2 py-2">
                                                                <input
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-medium p-2 text-center text-gray-700 placeholder:text-gray-300"
                                                                    value={item.expectedUnit || ''}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'expectedUnit', e.target.value)}
                                                                    placeholder="VD: Cái, Kg..."
                                                                />
                                                            </td>
                                                            <td className="p-2 py-2">
                                                                <input
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-medium p-2 text-center text-gray-700 placeholder:text-gray-300"
                                                                    value={item.expectedBrand || ''}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'expectedBrand', e.target.value)}
                                                                    placeholder="Nhãn hàng..."
                                                                />
                                                            </td>
                                                            <td className="p-2 py-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-black p-2 text-right tabular-nums focus:text-orange-600 transition-colors"
                                                                    value={item.expectedQuantity}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'expectedQuantity', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="p-2 py-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-black p-2 text-right tabular-nums focus:text-orange-600 transition-colors"
                                                                    value={item.expectedPrice}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'expectedPrice', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="p-2 py-3 text-right">
                                                                <div className="bg-orange-50/50 border border-orange-100 rounded px-2 py-1.5 flex items-center justify-end">
                                                                    <span className="text-[11px] font-black text-orange-600 tabular-nums truncate">
                                                                        {new Intl.NumberFormat('vi-VN').format(Number(item.expectedQuantity) * Number(item.expectedPrice))} đ
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-2 py-2">
                                                                <input
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-medium p-2 text-gray-700 placeholder:text-gray-300"
                                                                    value={item.expectedPurchaseLocation || ''}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'expectedPurchaseLocation', e.target.value)}
                                                                    placeholder="Địa điểm mua..."
                                                                />
                                                            </td>
                                                            <td className="p-2 py-2">
                                                                <input
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-medium p-2 text-gray-700 placeholder:text-gray-300 text-blue-500"
                                                                    value={item.expectedPurchaseLink || ''}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'expectedPurchaseLink', e.target.value)}
                                                                    placeholder="Link shopee, tiki..."
                                                                />
                                                            </td>
                                                            <td className="p-2 py-2">
                                                                <input
                                                                    className="w-full bg-white border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-[11px] font-medium p-2 text-gray-700 placeholder:text-gray-300"
                                                                    value={item.expectedNote || ''}
                                                                    onChange={e => handleItemChange(cIdx, iIdx, 'expectedNote', e.target.value)}
                                                                    placeholder="Ghi chú thêm..."
                                                                />
                                                            </td>
                                                            <td className="p-2 py-2 text-center align-middle relative">
                                                                <button onClick={() => removeItem(cIdx, iIdx)} className="p-1.5 rounded-lg bg-rose-50 text-rose-400 hover:text-white hover:bg-rose-500 transition-colors opacity-100">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
                                            <button onClick={() => addItem(cIdx)} className="text-[10px] font-black text-orange-400 uppercase tracking-widest hover:text-orange-600 transition-all flex items-center gap-1.5">
                                                <Plus className="w-3.5 h-3.5" /> Thêm hạng mục con
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 scrollbar-none pb-20">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Thông tin tổng quát</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Chiến dịch</span>
                                <span className="text-[10px] font-black text-gray-900 text-right uppercase line-clamp-1 ml-4" title={campaign.title}>{campaign.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Trạng thái</span>
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black rounded-full uppercase">ĐANG SỬA</span>
                            </div>

                            {expenditure?.rejectReason && (
                                <div className="pt-2 border-t border-gray-50">
                                    <label className="block text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1.5">Ghi chú từ Staff</label>
                                    <div className="p-2.5 bg-orange-50/50 border border-orange-100 rounded-xl">
                                        <p className="text-[11px] font-bold text-orange-900 leading-relaxed">{expenditure.rejectReason}</p>
                                    </div>
                                </div>
                            )}

                            {campaign.type === 'AUTHORIZED' && (
                                <div className="pt-2 border-t border-gray-50">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Hạn nộp minh chứng</label>
                                    <div className="w-full rounded-xl border border-black/5 bg-gray-50/50 p-2 text-xs font-bold text-gray-500 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {evidenceDueAt ? new Date(evidenceDueAt).toLocaleDateString('vi-VN') : 'Không có'}
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-100 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Tổng tiền dự tính</span>
                                    <span className={`text-xl font-black tracking-tighter tabular-nums transition-colors ${calculateTotal() !== originalTotal ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {new Intl.NumberFormat('vi-VN').format(calculateTotal())} <span className="text-[10px] text-gray-400">đ</span>
                                    </span>
                                </div>
                                {calculateTotal() !== originalTotal && (
                                    <div className="mt-1 flex flex-col items-end gap-0.5">
                                        <p className="text-[10px] font-bold text-rose-500 italic">Chưa khớp với số tiền cần sửa</p>
                                        <p className="text-[11px] font-black text-gray-400">Yêu cầu: {new Intl.NumberFormat('vi-VN').format(originalTotal)} đ</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-4 bg-[#ff5e14] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#e05313] transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? 'ĐANG XỬ LÝ...' : <><Save className="w-4 h-4" /> CẬP NHẬT NGAY</>}
                        </button>
                        <Link
                            href={`/account/campaigns/expenditures?campaignId=${campaign.id}`}
                            className="block text-center py-2 text-[10px] font-black text-gray-400 uppercase hover:text-gray-600 transition-colors"
                        >
                            Hủy & quay lại
                        </Link>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
}
