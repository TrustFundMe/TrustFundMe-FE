'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, FileSpreadsheet, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { aiService } from '@/services/aiService';
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
}

const PAGE_SIZE = 5;

export default function Step3FinancialPlan({ data, onChange }: Step3FinancialPlanProps) {
    const { toast } = useToast();
    const [isParsing, setIsParsing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const items: ExpenditureItem[] = data.expenditureItems || [];
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Pagination
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pagedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        // Jump to last page
        setCurrentPage(Math.ceil(updated.length / PAGE_SIZE));
    };

    const removeItem = (id: string) => {
        const updated = items.filter(item => item.id !== id);
        onChange('expenditureItems', updated);
        // Adjust page if needed
        const newTotal = Math.ceil(updated.length / PAGE_SIZE) || 1;
        if (currentPage > newTotal) setCurrentPage(newTotal);
    };

    const updateItem = (id: string, field: keyof ExpenditureItem, value: any) => {
        onChange('expenditureItems', items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleFileUpload = async (file: File) => {
        setIsParsing(true);
        try {
            const parsedItems = await aiService.parseExpenditureExcel(file);
            if (!parsedItems || parsedItems.length === 0) {
                toast('Không tìm thấy dữ liệu vật phẩm trong file. Vui lòng kiểm tra lại.', 'error');
                return;
            }
            const newItems: ExpenditureItem[] = parsedItems.map(item => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.name || '',
                unit: item.unit || 'chiếc',
                quantity: Math.max(1, parseInt(String(item.quantity)) || 1),
                price: Math.max(0, parseInt(String(item.price)) || 0),
                note: item.note || '',
            }));
            const updated = [...items, ...newItems];
            onChange('expenditureItems', updated);
            setCurrentPage(Math.ceil(updated.length / PAGE_SIZE));
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
                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-gray-50 text-[10px] font-black text-black/20 uppercase tracking-[2px]">
                        Hệ thống tự động thiết lập minh chứng
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange('fundType', 'ITEMIZED')}
                        className="text-[10px] font-black text-[#dc2626] uppercase tracking-[2px] hover:underline"
                    >
                        Thay đổi sang Quỹ Tự Lập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Import Area */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isParsing && fileInputRef.current?.click()}
                className={`relative group h-20 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-4 overflow-hidden ${isDragging
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
                        <span className="text-xs font-black text-black">AI đang phân tích và lọc dữ liệu...</span>
                    </div>
                ) : (
                    <>
                        <div className={`h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${isDragging ? 'rotate-12 scale-105' : ''}`}>
                            <FileSpreadsheet className={`h-4 w-4 ${isDragging ? 'text-[#dc2626]' : 'text-black/20'}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-black group-hover:text-[#dc2626] transition-colors">
                                {isDragging ? 'Thả tệp vào đây' : 'Import kế hoạch từ Excel (AI)'}
                            </span>
                            <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">
                                AI tự động lọc đúng cột — Kéo thả hoặc nhấn để chọn tệp
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                <div className="px-8 pt-6 pb-4 flex items-center justify-between">
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
                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                            {items.length} Vật phẩm
                        </span>
                    </div>
                </div>

                <div className="px-4 max-h-[300px] overflow-y-auto custom-scrollbar">
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
                            {pagedItems.map((item, pageIndex) => {
                                const globalIndex = (currentPage - 1) * PAGE_SIZE + pageIndex;
                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="px-3 py-3 text-xs font-black text-black/20">{globalIndex + 1}</td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                placeholder="Tên vật phẩm..."
                                                className="w-full bg-transparent border-none p-0 text-sm font-black text-black placeholder:text-black/5 focus:ring-0"
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <input
                                                type="text"
                                                value={item.note}
                                                onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                                                placeholder="Ghi chú thêm..."
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
                                                placeholder="0"
                                                className="w-full text-right bg-transparent border-none p-0 text-sm font-black text-black focus:ring-0"
                                            />
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-black">
                                                    {(item.quantity * item.price).toLocaleString('vi-VN')}
                                                </span>
                                                <span className="text-[8px] font-bold text-black/10 uppercase tracking-tighter">VNĐ</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="h-8 w-8 rounded-full flex items-center justify-center text-white bg-black hover:bg-red-600 transition-all duration-300 shadow-sm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-[10px] font-bold text-black/20 uppercase tracking-widest italic">
                                        Chưa có vật phẩm — Thêm mới hoặc import từ Excel
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total */}
                <div className="flex items-center justify-end gap-4 px-6 py-2 border-t border-gray-50/80">
                    {total > data.targetAmount && (
                        <span className="text-[10px] font-black text-rose-500 uppercase animate-pulse">
                            ⚠️ Vượt quá mục tiêu quỹ, hãy giảm bớt vật phẩm hoặc tăng mục tiêu ở bước 2
                        </span>
                    )}
                    <span className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Tổng cộng dự chi</span>
                    <div className="flex flex-col items-end">
                        <span className={`text-lg font-black ${total > data.targetAmount ? 'text-rose-600' : 'text-[#dc2626]'}`}>{total.toLocaleString('vi-VN')}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${total > data.targetAmount ? 'text-rose-600/40' : 'text-[#dc2626]/40'}`}>VNĐ</span>
                    </div>
                </div>

                {/* Add item + Pagination */}
                <div className="p-3 border-t border-gray-50 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black text-black/30 uppercase tracking-[2px] hover:text-[#dc2626] hover:bg-red-50 transition-all group"
                    >
                        <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                        Thêm vật phẩm mới
                    </button>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-50 text-black/30 hover:bg-[#dc2626] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-[10px] font-black text-black/30 uppercase tracking-widest min-w-[60px] text-center">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-50 text-black/30 hover:bg-[#dc2626] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 px-6 py-3 border-t border-gray-50">
                    <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-800/60 leading-relaxed">
                        Kế hoạch chi tiêu này sẽ được cộng đồng giám sát. Hãy đảm bảo tính chính xác để tăng độ tin cậy của chiến dịch.
                    </p>
                </div>
            </div>
        </div>
    );
}
