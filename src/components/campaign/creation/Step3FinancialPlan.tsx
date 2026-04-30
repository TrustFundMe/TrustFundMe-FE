'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, FileSpreadsheet, ShieldCheck, ChevronLeft, ChevronRight, Download, Sparkles } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { expenditureService } from '@/services/expenditureService';
import { useToast } from '@/components/ui/Toast';

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

interface ExpenditureItem {
    id: string;
    name: string;
    expectedPurchaseLink?: string;
    actualPurchaseLink?: string;
    unit: string;
    quantity: number;
    price: number;
    note: string;
}

interface Step3FinancialPlanProps {
    data: any;
    onChange: (key: any, value: any) => void;
    onPrev: () => void;
    onNext: () => void;
}

const PAGE_SIZE = 5;

export default function Step3FinancialPlan({ data, onChange, onPrev, onNext }: Step3FinancialPlanProps) {
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const excelInputRef = useRef<HTMLInputElement>(null);

    // ── Excel Import / Export ───────────────────────────────────────────────
    const handleDownloadTemplate = () => {
        import('xlsx').then((XLSX) => {
            const headers = [['STT', 'Tên vật phẩm', 'Link mua dự kiến', 'Đơn vị', 'Số lượng', 'Đơn giá (VNĐ)', 'Ghi chú']];
            const example = [[1, 'Ví dụ: Mì tôm', 'https://maps.app.goo.gl/xxx', 'thùng', 10, 50000, 'Chi tiêu đợt 1']];
            const ws = XLSX.utils.aoa_to_sheet([...headers, ...example]);
            ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 25 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Mẫu');
            XLSX.writeFile(wb, 'Mau_KeHoach_ChiTieu.xlsx');
        });
    };

    const handleExportItems = () => {
        import('xlsx').then((XLSX) => {
            const rows = items.map((item, idx) => [
                idx + 1,
                item.name,
                item.expectedPurchaseLink || '',
                item.unit,
                item.quantity,
                item.price,
                (item.quantity * item.price).toLocaleString('vi-VN'),
                item.note,
            ]);
            const ws = XLSX.utils.aoa_to_sheet([
                ['STT', 'Tên vật phẩm', 'Link mua dự kiến', 'Đơn vị', 'Số lượng', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)', 'Ghi chú'],
                ...rows,
            ]);
            ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 18 }, { wch: 25 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Chi tiêu');
            const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '');
            XLSX.writeFile(wb, `KeHoach_ChiTieu_${today}.xlsx`);
        });
    };

    const [isExcelImporting, setIsExcelImporting] = useState(false);

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsExcelImporting(true);
        try {
            const result = await expenditureService.importItemsFromExcel(file);
            if (!result.success || !result.data) {
                toast(result.error || 'Không thể đọc file Excel', 'error');
                return;
            }

            const errors: string[] = [];
            result.data.forEach((item, idx) => {
                const row = idx + 1;
                const errs: string[] = [];
                if (!item.name || item.name.trim() === '') {
                    errs.push(`Dòng ${row}: Thiếu tên vật phẩm`);
                }
                const qty = Number(item.quantity);
                if (item.quantity === undefined || item.quantity === null || isNaN(qty)) {
                    errs.push(`Dòng ${row}: Thiếu số lượng`);
                } else if (qty <= 0) {
                    errs.push(`Dòng ${row}: Số lượng phải lớn hơn 0`);
                } else if (!Number.isInteger(qty)) {
                    errs.push(`Dòng ${row}: Số lượng phải là số nguyên`);
                } else if (qty > 10000) {
                    errs.push(`Dòng ${row}: Số lượng không được vượt quá 10.000`);
                }
                const price = Number(item.expectedPrice);
                if (item.expectedPrice === undefined || item.expectedPrice === null || isNaN(price)) {
                    errs.push(`Dòng ${row}: Thiếu đơn giá`);
                } else if (price < 0) {
                    errs.push(`Dòng ${row}: Đơn giá không được nhỏ hơn 0`);
                }
                if (item.name && item.name.trim().length > 50) {
                    errs.push(`Dòng ${row}: Tên vật phẩm không được vượt quá 50 ký tự`);
                }
                if (item.note && item.note.trim().length > 100) {
                    errs.push(`Dòng ${row}: Ghi chú không được vượt quá 100 ký tự`);
                }
                if (item.expectedPurchaseLink && item.expectedPurchaseLink.trim() !== '' && !URL_REGEX.test(item.expectedPurchaseLink)) {
                    errs.push(`Dòng ${row}: Link mua hàng không đúng định dạng`);
                }
                errors.push(...errs);
            });

            if (errors.length > 0) {
                toast('File Excel có lỗi:\n' + errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n...và ${errors.length - 10} lỗi khác` : ''), 'error');
                return;
            }

            const newItems: ExpenditureItem[] = result.data.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.name || '',
                expectedPurchaseLink: item.expectedPurchaseLink || item.purchaseLink || '',
                unit: item.unit || '',
                quantity: Number(item.quantity) || 1,
                price: Number(item.expectedPrice) || 0,
                note: item.note || '',
            }));
            const updated = [...items, ...newItems];
            onChange('expenditureItems', updated);
            setCurrentPage(Math.ceil(updated.length / PAGE_SIZE));
            toast(`Đã nhập ${newItems.length} vật phẩm từ file Excel!`, 'success');
        } catch (err: any) {
            console.error('[Excel Import Error]', err);
            toast('Lỗi khi nhập file Excel', 'error');
        } finally {
            setIsExcelImporting(false);
            e.target.value = '';
        }
    };

    const items: ExpenditureItem[] = data.expenditureItems || [];
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Pagination
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pagedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const addItem = () => {
        const newItem: ExpenditureItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            expectedPurchaseLink: '',
            unit: '',
            quantity: 1,
            price: 0,
            note: '',
        };
        const updated = [...items, newItem];
        onChange('expenditureItems', updated);
        setCurrentPage(Math.ceil(updated.length / PAGE_SIZE));
    };

    const removeItem = (id: string) => {
        const updated = items.filter(item => item.id !== id);
        onChange('expenditureItems', updated);
        const newTotal = Math.ceil(updated.length / PAGE_SIZE) || 1;
        if (currentPage > newTotal) setCurrentPage(newTotal);
    };

    const updateItem = (id: string, field: keyof ExpenditureItem, value: any) => {
        onChange('expenditureItems', items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };


    if (data.fundType === 'AUTHORIZED') {
        return (
            <div className="max-w-3xl mx-auto py-20 px-10 text-center bg-white rounded-[4rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-700">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-indigo-50 text-[#6366F1] shadow-inner mb-8 rotate-3">
                    <ShieldCheck className="h-12 w-12" />
                </div>
                <h3 className="text-3xl font-black text-black tracking-tight mb-4">Chế độ Quỹ Ủy Quyền</h3>
                <div className="space-y-4 max-w-lg mx-auto">
                    <p className="text-sm font-bold text-black/60 leading-relaxed">
                        Đối với mô hình Quỹ Ủy quyền, sau khi chiến dịch được phê duyệt thành công, bạn sẽ thực hiện gửi <span className="text-indigo-600 font-black">Bảng chi tiêu chi tiết theo từng đợt giải ngân</span>.
                    </p>
                    <div className="h-px w-12 bg-gray-100 mx-auto" />
                    <p className="text-xs font-bold text-black/40 leading-relaxed italic">
                        Mọi thông tin chi tiêu sẽ được đội ngũ <span className="text-black font-black">Staff kiểm duyệt nghiêm ngặt</span> trước khi chính thức công khai lên hệ thống.
                    </p>
                </div>
                <div className="mt-12 flex flex-col items-center gap-4 text-center">
                    <button
                        type="button"
                        onClick={() => onChange('fundType', 'ITEMIZED')}
                        className="text-[10px] font-black text-[#dc2626] uppercase tracking-[2px] hover:underline"
                    >
                        Thay đổi sang Quỹ Vật Phẩm
                    </button>
                </div>

                <div className="mt-6 flex justify-end items-center gap-4 py-2 px-1 border-t border-black/5 pt-6">
                    <button type="button" onClick={onPrev} className="text-sm font-black text-black/20 hover:text-black transition-colors">Prev</button>
                    <div className="h-4 w-px bg-black/10" />
                    <button type="button" onClick={onNext} className="text-sm font-black text-[#dc2626] hover:text-red-700 transition-colors">Next</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row gap-3">


                {/* Excel Import */}
                <div
                    onClick={() => !isExcelImporting && excelInputRef.current?.click()}
                    className={`relative group h-16 flex-1 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-3 overflow-hidden ${isExcelImporting
                        ? 'cursor-wait border-[#dc2626] bg-[#dc2626]/5'
                        : 'border-black/5 bg-gray-50/50 hover:bg-white hover:border-black/10'
                        }`}
                >
                    <input
                        type="file"
                        ref={excelInputRef}
                        className="hidden"
                        onChange={handleExcelImport}
                        accept=".xlsx,.xls"
                    />

                    {isExcelImporting ? (
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dc2626] border-t-transparent shadow-sm" />
                            <span className="text-xs font-black text-black">Đang nhập...</span>
                        </div>
                    ) : (
                        <>
                            <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <FileSpreadsheet className="h-4 w-4 text-black/20" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-black group-hover:text-[#dc2626] transition-colors">
                                    Nhập Excel trực tiếp
                                </span>
                                <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">
                                    Nhấn để chọn tệp Excel (.xlsx)
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tải mẫu / Xuất Excel buttons */}
            <div className="flex items-center justify-end gap-1.5">
                <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[9px] font-black text-gray-500 hover:text-[#dc2626] px-3 py-1 rounded-full bg-gray-50 border border-gray-200 transition-all uppercase tracking-widest"
                >
                    Tải mẫu
                </button>
                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={handleExportItems}
                        className="text-[9px] font-black text-gray-500 hover:text-[#dc2626] px-3 py-1 rounded-full bg-gray-50 border border-gray-200 transition-all uppercase tracking-widest"
                    >
                        Xuất Excel
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden max-h-[calc(100vh-14rem)] flex flex-col">
                <div className="px-8 pt-5 pb-3 flex items-center justify-between shrink-0">
                    <h4 className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Chi tiết vật phẩm chi tiêu</h4>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={() => { onChange('expenditureItems', []); setCurrentPage(1); }}
                                className="text-[9px] font-black text-red-400 hover:text-white hover:bg-red-500 px-3 py-1 rounded-full bg-red-50 transition-all uppercase tracking-widest"
                            >
                                Xóa hết
                            </button>
                        )}
                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{items.length} Vật phẩm</span>
                    </div>
                </div>

                <div className="px-4 overflow-y-auto custom-scrollbar shrink-0" style={{ maxHeight: '200px' }}>
                    <table className="w-full">
                        <thead>
                            <tr className="text-[9px] font-black text-black/20 uppercase tracking-widest border-b border-gray-50">
                                <th className="px-2 py-2 text-left font-black w-8">#</th>
                                <th className="px-2 py-2 text-left font-black w-32">Vật phẩm</th>
                                <th className="px-2 py-2 text-left font-black">Link địa chỉ</th>
                                <th className="px-2 py-2 text-left font-black w-24">Ghi chú</th>
                                <th className="px-1 py-2 text-center font-black w-14">SL</th>
                                <th className="px-1 py-2 text-right font-black w-20">Đơn giá</th>
                                <th className="px-2 py-2 text-right font-black w-24">Thành tiền</th>
                                <th className="px-2 py-2 w-9"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {pagedItems.map((item, idx) => {
                                const globalIndex = (currentPage - 1) * PAGE_SIZE + idx;
                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-2 py-2 text-[10px] font-black text-black/20">{globalIndex + 1}</td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-xs font-black text-black placeholder:text-black/5 focus:ring-0"
                                                placeholder="Tên..."
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={item.expectedPurchaseLink || ''}
                                                onChange={(e) => updateItem(item.id, 'expectedPurchaseLink', e.target.value)}
                                                className={`w-full bg-gray-50/50 rounded px-1.5 py-1 text-[10px] font-bold border-none focus:ring-1 focus:ring-[#dc2626]/20 ${item.expectedPurchaseLink && !URL_REGEX.test(item.expectedPurchaseLink) ? 'text-rose-500 bg-rose-50' : 'text-blue-500'}`}
                                                placeholder="https://..."
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={item.note}
                                                onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-black/50 placeholder:text-black/5 focus:ring-0"
                                            />
                                        </td>
                                        <td className="px-1 py-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-12 text-center bg-gray-50/50 rounded-lg px-1 py-1 text-xs font-black border-none focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all block mx-auto"
                                            />
                                        </td>
                                        <td className="px-1 py-2">
                                            <input
                                                type="text"
                                                value={item.price === 0 ? '' : item.price.toLocaleString('vi-VN')}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    updateItem(item.id, 'price', val === '' ? 0 : parseInt(val));
                                                }}
                                                className="w-full text-right bg-transparent border-none p-0 text-xs font-black text-black focus:ring-0"
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-black">{(item.quantity * item.price).toLocaleString('vi-VN')}</span>
                                                <span className="text-[7px] font-bold text-black/10 uppercase tracking-tighter">VNĐ</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <button type="button" onClick={() => removeItem(item.id)} className="h-7 w-7 rounded-full flex items-center justify-center text-white bg-black hover:bg-red-600 transition-all duration-300 shadow-sm">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-end gap-4 px-5 py-2 border-t border-gray-50/80 shrink-0">
                    {total > data.targetAmount && <span className="text-[10px] font-black text-rose-500 uppercase animate-pulse">⚠️ Vượt mục tiêu</span>}
                    <span className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Tổng dự chi</span>
                    <div className="flex flex-col items-end">
                        <span className={`text-base font-black ${total > data.targetAmount ? 'text-rose-600' : 'text-[#dc2626]'}`}>{total.toLocaleString('vi-VN')}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">VND</span>
                    </div>
                </div>

                <div className="px-5 py-2 border-t border-gray-50 flex items-center justify-between shrink-0">
                    <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black text-black/30 uppercase tracking-[2px] hover:text-[#dc2626] hover:bg-red-50 transition-all group">
                        <Plus className="h-3 w-3 transition-transform group-hover:rotate-90" /> Thêm vật phẩm
                    </button>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-50 text-black/30 hover:bg-[#dc2626] hover:text-white transition-all disabled:opacity-30"><ChevronLeft className="h-3 w-3" /></button>
                            <span className="text-[9px] font-black text-black/30 uppercase tracking-widest min-w-[50px] text-center">{currentPage} / {totalPages}</span>
                            <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-50 text-black/30 hover:bg-[#dc2626] hover:text-white transition-all disabled:opacity-30"><ChevronRight className="h-3 w-3" /></button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 px-5 py-2 border-t border-gray-50 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <p className="text-[9px] font-bold text-amber-800/60 leading-relaxed">Kế hoạch chi tiêu này sẽ được cộng đồng giám sát. Lưu ý: đây chỉ là kế hoạch dự kiến.</p>
                </div>

                <div className="px-8 py-2.5 border-t border-black/5 flex justify-end items-center gap-4 bg-gray-50/10 shrink-0">
                    <button type="button" onClick={onPrev} className="text-sm font-black text-black/20 hover:text-black transition-colors">Prev</button>
                    <div className="h-4 w-px bg-black/10" />
                    <button type="button" onClick={onNext} className="text-sm font-black text-[#dc2626] hover:text-red-700 transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
}
