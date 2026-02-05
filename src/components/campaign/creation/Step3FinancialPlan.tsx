'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, FileSpreadsheet, Wand2, Upload, X, ShieldCheck } from 'lucide-react';

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

export default function Step3FinancialPlan({ data, onChange }: Step3FinancialPlanProps) {
    const [isParsing, setIsParsing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        onChange('expenditureItems', [...items, newItem]);
    };

    const removeItem = (id: string) => {
        onChange('expenditureItems', items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof ExpenditureItem, value: any) => {
        onChange('expenditureItems', items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleFileUpload = (file: File) => {
        setIsParsing(true);
        // Giả lập xử lý file AI
        setTimeout(() => {
            const mockItems: ExpenditureItem[] = [
                { id: Math.random().toString(), name: 'Sách giáo khoa lớp 1', unit: 'Bộ', quantity: 100, price: 250000, note: '' },
                { id: Math.random().toString(), name: 'Vở viết 96 trang', unit: 'Cuốn', quantity: 500, price: 8000, note: '' },
                { id: Math.random().toString(), name: 'Bút bi Thiên Long', unit: 'Hộp', quantity: 20, price: 120000, note: '' },
            ];
            onChange('expenditureItems', [...items, ...mockItems]);
            setIsParsing(false);
        }, 1500);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    if (data.fundType === 'AUTHORIZED') {
        return (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-[#6366F1] shadow-inner mb-6">
                    <ShieldCheck className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-black tracking-tight">Quỹ Ủy Quyền</h3>
                <p className="mt-3 text-sm font-medium text-black/40 mx-auto max-w-sm leading-relaxed">
                    Bạn đã chọn loại quỹ ủy quyền. Hệ thống sẽ tự động lập kế hoạch dựa trên các tiêu chuẩn minh bạch.
                </p>
                <button
                    type="button"
                    onClick={() => onChange('fundType', 'ITEMIZED')}
                    className="mt-8 text-xs font-black text-[#dc2626] uppercase tracking-widest hover:underline"
                >
                    Thay đổi sang Quỹ Tự Lập
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Import Area - Reduced height by 1/2 */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group h-20 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-4 overflow-hidden ${isDragging
                    ? 'border-[#dc2626] bg-[#dc2626]/5 scale-[0.98]'
                    : 'border-black/5 bg-gray-50/50 hover:bg-white hover:border-black/10'
                    }`}
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
                        <span className="text-xs font-black text-black">Đang bóc tách dữ liệu AI...</span>
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
                                Kéo thả hoặc nhấn để chọn tệp
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                <div className="px-8 pt-6 pb-4 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Chi tiết vật phẩm chi tiêu</h4>
                    <span className="text-[10px] font-black text-black/20 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                        {items.length} Vật phẩm
                    </span>
                </div>

                <div className="overflow-x-auto px-4">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-black/20 uppercase tracking-widest border-b border-gray-50">
                                <th className="px-4 py-3 text-left font-black">STT</th>
                                <th className="px-4 py-3 text-left font-black">Vật phẩm chi tiết</th>
                                <th className="px-4 py-3 text-center font-black">Số lượng</th>
                                <th className="px-4 py-3 text-right font-black">Đơn giá (VNĐ)</th>
                                <th className="px-4 py-3 text-right font-black">Thành tiền</th>
                                <th className="px-4 py-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {items.map((item, index) => (
                                <tr key={item.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-4 py-3 text-xs font-black text-black/20">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            placeholder="Tên vật phẩm, dịch vụ..."
                                            className="w-full bg-transparent border-none p-0 text-sm font-black text-black placeholder:text-black/5 focus:ring-0"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-12 text-center bg-gray-50/50 rounded-lg px-1 py-1 text-xs font-black border-none focus:ring-2 focus:ring-[#dc2626]/10 focus:bg-white transition-all"
                                            />
                                            <span className="text-[9px] font-black text-black/20 uppercase line-clamp-1">{item.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <input
                                                type="text"
                                                value={item.price === 0 ? '' : item.price.toLocaleString('vi-VN')}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    updateItem(item.id, 'price', val === '' ? 0 : parseInt(val));
                                                }}
                                                placeholder="0"
                                                className="w-24 text-right bg-transparent border-none p-0 text-sm font-black text-black focus:ring-0"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-black">
                                                {(item.quantity * item.price).toLocaleString('vi-VN')}
                                            </span>
                                            <span className="text-[8px] font-bold text-black/10 uppercase tracking-tighter">VNĐ</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="h-8 w-8 rounded-full flex items-center justify-center text-white bg-black hover:bg-red-600 transition-all duration-300 shadow-sm"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50/30">
                                <td colSpan={4} className="px-4 py-4 text-right">
                                    <span className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Tổng cộng dự chi</span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-[#dc2626]">
                                            {total.toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-[9px] font-black text-[#dc2626]/40 uppercase tracking-widest">VNĐ</span>
                                    </div>
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="p-2 border-t border-gray-50 flex justify-center">
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black text-black/30 uppercase tracking-[2px] hover:text-[#dc2626] hover:bg-red-50 transition-all group"
                    >
                        <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                        Thêm vật phẩm mới
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                    Kế hoạch chi tiêu này sẽ được cộng đồng giám sát. Hãy đảm bảo tính chính xác để tăng độ tin cậy của chiến dịch.
                </p>
            </div>
        </div>
    );
}
