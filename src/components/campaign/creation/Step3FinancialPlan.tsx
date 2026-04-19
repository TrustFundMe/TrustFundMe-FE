'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, FileSpreadsheet, ShieldCheck, ChevronLeft, ChevronRight, Download, Sparkles } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { expenditureService } from '@/services/expenditureService';
import { useToast } from '@/components/ui/Toast';

interface ExpenditureItem {
    id: string;
    name: string;
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

export default function Step3FinancialPlan({ data, onChange, onPrev, onNext }: Step3FinancialPlanProps) {
    const { toast } = useToast();
    const [isParsing, setIsParsing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    // ── Excel Import / Export ───────────────────────────────────────────────
    const handleDownloadTemplate = () => {
        import('xlsx').then((XLSX) => {
            const headers = [['STT', 'Tên vật phẩm', 'Đơn vị', 'Số lượng', 'Đơn giá (VNĐ)', 'Ghi chú']];
            const example = [[1, 'Ví dụ: Mì tôm', 'thùng', 10, 50000, 'Chi tiêu đợt 1']];
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
                item.unit,
                item.quantity,
                item.price,
                (item.quantity * item.price).toLocaleString('vi-VN'),
                item.note,
            ]);
            const ws = XLSX.utils.aoa_to_sheet([
                ['STT', 'Tên vật phẩm', 'Đơn vị', 'Số lượng', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)', 'Ghi chú'],
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
                if (!item.category || item.category.trim() === '') {
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
                if (item.category && item.category.trim().length > 50) {
                    errs.push(`Dòng ${row}: Tên vật phẩm không được vượt quá 50 ký tự`);
                }
                if (item.note && item.note.trim().length > 100) {
                    errs.push(`Dòng ${row}: Ghi chú không được vượt quá 100 ký tự`);
                }
                errors.push(...errs);
            });

            if (errors.length > 0) {
                toast('File Excel có lỗi:\n' + errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n...và ${errors.length - 10} lỗi khác` : ''), 'error');
                return;
            }

            const newItems: ExpenditureItem[] = result.data.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.category || '',
                unit: 'chiếc',
                quantity: Number(item.quantity) || 1,
                price: Number(item.expectedPrice) || 0,
                note: item.note || '',
            }));
            const updated = [...items, ...newItems];
            onChange('expenditureItems', updated);
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

    const addItem = () => {
        const newItem: ExpenditureItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            unit: 'chiếc',
            quantity: 1,
            price: 0,
            note: '',
        };
        const updated = [...items, newItem];
        onChange('expenditureItems', updated);
    };

    const removeItem = (id: string) => {
        const updated = items.filter(item => item.id !== id);
        onChange('expenditureItems', updated);
    };

    const updateItem = (id: string, field: keyof ExpenditureItem, value: any) => {
        onChange('expenditureItems', items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleFileUpload = async (file: File) => {
        setIsParsing(true);
        try {
            const result = await expenditureService.importItemsFromExcel(file);
            if (!result.success || !result.data) {
                toast(result.error || 'Không thể đọc file Excel', 'error');
                return;
            }

            // Validate items from Excel
            const errors: string[] = [];
            result.data.forEach((item, idx) => {
                const row = idx + 1;
                const errs: string[] = [];
                if (!item.category || item.category.trim() === '') {
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
                if (item.category && item.category.trim().length > 50) {
                    errs.push(`Dòng ${row}: Tên vật phẩm không được vượt quá 50 ký tự`);
                }
                if (item.note && item.note.trim().length > 100) {
                    errs.push(`Dòng ${row}: Ghi chú không được vượt quá 100 ký tự`);
                }
                errors.push(...errs);
            });

            if (errors.length > 0) {
                toast('File Excel có lỗi:\n' + errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n...và ${errors.length - 10} lỗi khác` : ''), 'error');
                return;
            }

            const newItems: ExpenditureItem[] = result.data.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.category || '',
                unit: 'chiếc',
                quantity: Number(item.quantity) || 1,
                price: Number(item.expectedPrice) || 0,
                note: item.note || '',
            }));
            const updated = [...items, ...newItems];
            onChange('expenditureItems', updated);
            toast(`Đã nhập ${newItems.length} vật phẩm từ file Excel!`, 'success');
        } catch (err: any) {
            console.error('[Excel Parse Error]', err);
            toast('Không thể phân tích file. Đảm bảo AI Service đang chạy và thử lại.', 'error');
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
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
        <div className="max-w-5xl mx-auto w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row gap-4">
                {/* AI Import */}
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => !isParsing && fileInputRef.current?.click()}
                    className={`relative group h-24 flex-1 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-4 overflow-hidden ${isDragging
                        ? 'border-[#dc2626] bg-[#dc2626]/5 scale-[0.98]'
                        : 'border-black/5 bg-gray-50/50 hover:bg-white hover:border-black/10'
                        } ${isParsing ? 'cursor-wait' : ''}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        accept=".xlsx,.xls,.csv"
                    />

                    {isParsing ? (
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dc2626] border-t-transparent shadow-sm" />
                            <span className="text-xs font-black text-black">AI đang phân tích...</span>
                        </div>
                    ) : (
                        <>
                            <div className={`h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${isDragging ? 'rotate-12 scale-105' : ''}`}>
                                <Sparkles className={`h-5 w-5 ${isDragging ? 'text-[#dc2626]' : 'text-indigo-400'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-black group-hover:text-[#dc2626] transition-colors">
                                    {isDragging ? 'Thả tệp vào đây' : 'Phân tích kế hoạch bằng AI'}
                                </span>
                                <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">
                                    Kéo thả hoặc nhấn để chọn tệp
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Excel Section (Integrated Frame) */}
                <div
                    className={`flex-[1.8] h-24 rounded-[1.5rem] border-2 border-dashed bg-gray-50/50 flex transition-all overflow-hidden border-black/5`}
                >
                    {/* Left Part: Download Template (2/3 width) */}
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="flex-[2] flex items-center justify-center gap-4 px-6 hover:bg-indigo-50/50 transition-all group border-r-2 border-dashed border-black/5"
                    >
                        <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-black text-black group-hover:text-indigo-600 transition-colors">Xuất mẫu Excel</span>
                            <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest leading-none">Tải file mẫu (.xlsx)</span>
                        </div>
                    </button>

                    {/* Right Part: Upload Area (1/3 width) */}
                    <div
                        onClick={() => !isExcelImporting && excelInputRef.current?.click()}
                        className={`flex-1 relative group cursor-pointer flex items-center justify-center gap-3 hover:bg-white transition-all ${isExcelImporting ? 'cursor-wait' : ''}`}
                    >
                        <input
                            type="file"
                            ref={excelInputRef}
                            className="hidden"
                            onChange={handleExcelImport}
                            accept=".xlsx,.xls"
                        />

                        {isExcelImporting ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dc2626] border-t-transparent shadow-sm" />
                        ) : (
                            <>
                                <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet className="h-5 w-5 text-black/20" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs font-black text-black group-hover:text-[#dc2626] transition-colors">Nhập Excel</span>
                                    <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest leading-none">Nhấn để chọn</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                <div className="px-8 pt-4 pb-2 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Chi tiết vật phẩm chi tiêu</h4>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={() => { onChange('expenditureItems', []); }}
                                className="text-[9px] font-black text-red-400 hover:text-white hover:bg-red-500 px-3 py-1 rounded-full bg-red-50 transition-all uppercase tracking-widest"
                            >
                                Xóa hết
                            </button>
                        )}
                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{items.length} Vật phẩm</span>
                    </div>
                </div>

                <div className="px-4 max-h-[225px] overflow-y-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-black/20 uppercase tracking-widest border-b border-gray-50">
                                <th className="px-3 py-3 text-left font-black">STT</th>
                                <th className="px-3 py-3 text-left font-black w-[28%]">Vật phẩm chi tiết</th>
                                <th className="px-3 py-3 text-left font-black w-[11%]">Ghi chú</th>
                                <th className="px-1 py-3 text-center font-black">Số lượng</th>
                                <th className="px-1 py-3 text-right font-black">Đơn giá (VNĐ)</th>
                                <th className="px-3 py-3 text-right font-black w-[15%]">Thành tiền</th>
                                <th className="px-3 py-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {items.map((item, idx) => {
                                const globalIndex = idx;
                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-3 py-3 text-xs font-black text-black/20">{globalIndex + 1}</td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-sm font-black text-black placeholder:text-black/5 focus:ring-0"
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                value={item.note}
                                                onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-xs font-bold text-black/50 placeholder:text-black/5 focus:ring-0"
                                            />
                                        </td>
                                        <td className="px-1 py-3">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-16 text-center bg-gray-50/50 rounded-lg px-1 py-1 text-xs font-black border-none focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all block mx-auto"
                                            />
                                        </td>
                                        <td className="px-1 py-3">
                                            <input
                                                type="text"
                                                value={item.price === 0 ? '' : item.price.toLocaleString('vi-VN')}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    updateItem(item.id, 'price', val === '' ? 0 : parseInt(val));
                                                }}
                                                className="w-full text-right bg-transparent border-none p-0 text-sm font-black text-black focus:ring-0"
                                            />
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-black">{(item.quantity * item.price).toLocaleString('vi-VN')}</span>
                                                <span className="text-[8px] font-bold text-black/10 uppercase tracking-tighter">VNĐ</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <button type="button" onClick={() => removeItem(item.id)} className="h-8 w-8 rounded-full flex items-center justify-center text-white bg-black hover:bg-red-600 transition-all duration-300 shadow-sm">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-end gap-4 px-6 py-1.5 border-t border-gray-50/80">
                    {total > data.targetAmount && <span className="text-[10px] font-black text-rose-500 uppercase animate-pulse">⚠️ Vượt quá mục tiêu quỹ</span>}
                    <span className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Tổng cộng dự chi</span>
                    <div className="flex flex-col items-end">
                        <span className={`text-lg font-black ${total > data.targetAmount ? 'text-rose-600' : 'text-[#dc2626]'}`}>{total.toLocaleString('vi-VN')}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">VNĐ</span>
                    </div>
                </div>

                <div className="p-2 border-t border-gray-50 flex items-center justify-between">
                    <button type="button" onClick={addItem} className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black text-black/30 uppercase tracking-[2px] hover:text-[#dc2626] hover:bg-red-50 transition-all group">
                        <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" /> Thêm vật phẩm
                    </button>
                </div>

                <div className="flex items-center gap-3 px-6 py-2 border-t border-gray-50">
                    <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-800/60 leading-relaxed">Kế hoạch chi tiêu này sẽ được cộng đồng giám sát. Lưu ý: đây chỉ là kế hoạch dự kiến.</p>
                </div>

                <div className="px-8 py-2.5 border-t border-black/5 flex justify-end items-center gap-4 bg-gray-50/10">
                    <button type="button" onClick={onPrev} className="text-sm font-black text-black/20 hover:text-black transition-colors">Prev</button>
                    <div className="h-4 w-px bg-black/10" />
                    <button type="button" onClick={onNext} className="text-sm font-black text-[#dc2626] hover:text-red-700 transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
}
