'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { NewCampaignTestState, Milestone, MilestoneCategory } from '../types';
import { useToast } from '@/components/ui/Toast';
import { expenditureService } from '@/services/expenditureService';
import StepFooter from '../parts/StepFooter';

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

interface Props {
  state: NewCampaignTestState;
  milestoneTotal: number;
  onPatch: (patch: Partial<NewCampaignTestState>) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
  showErrors?: boolean;
  failMessage?: string;
}

const inCls =
  'rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition duration-150 placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-1 focus:ring-black/5';

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5 6h10M8 6V4h4v2M6 6l1 11h6l1-11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9v6M12 9v6" strokeLinecap="round" />
    </svg>
  );
}

function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN');
}

export default function Step3Milestones({ state, milestoneTotal, onPatch, onPrev, onNext, canNext, showErrors, failMessage }: Props) {
  const target = state.campaignCore.targetAmount;
  const milestonesOk = milestoneTotal === target && target > 0;
  const today = new Date().toISOString().split('T')[0];
  const campaignStart = state.campaignCore.startDate;
  const campaignEnd = state.campaignCore.endDate;

  const updateMilestone = (id: string, patch: Partial<Milestone>) => {
    onPatch({ milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  };

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const formatDateForInput = (val: any) => {
    if (!val) return today;
    const s = String(val).trim();
    // Try dd/mm/yyyy
    const parts = s.split(/[/-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return s; // yyyy-mm-dd
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // dd/mm/yyyy -> yyyy-mm-dd
    }
    return s;
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await expenditureService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mau_Ke_Hoach_Chi_Tieu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast('Lỗi khi tải file mẫu', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const res = await expenditureService.importBulkFromExcel(file);
      if (res.success && res.data) {
        const importedMilestones: Milestone[] = res.data.map((m: any) => ({
          id: `mil-${Math.random().toString(36).slice(2, 9)}`,
          title: m.milestoneTitle,
          description: m.description || '',
          plannedAmount: 0,
          releaseCondition: m.releaseCondition || '',
          startDate: formatDateForInput(m.startDate),
          endDate: formatDateForInput(m.endDate),
          categories: (m.categories || []).map((cat: any) => ({
            id: `cat-${Math.random().toString(36).slice(2, 9)}`,
            name: cat.name,
            description: '',
            balance: 0,
            items: (cat.items || []).map((item: any) => ({
              id: `ci-${Math.random().toString(36).slice(2, 9)}`,
              name: item.category, // Backend uses 'category' for item name in creation DTO
              expectedQuantity: item.expectedQuantity,
              actualQuantity: 0,
              expectedPrice: item.expectedPrice,
              actualPrice: 0,
              unit: item.unit || '',
              brand: item.brand || '',
              purchaseLocation: item.purchaseLocation || '',
              expectedPurchaseLink: item.expectedPurchaseLink || item.purchaseLink || '',
              note: item.note || ''
            }))
          }))
        }));

        onPatch({ milestones: importedMilestones });
        toast(`Đã nhập thành công ${importedMilestones.length} đợt giải ngân`, 'success');
      } else {
        toast(res.error || 'Lỗi khi nhập file Excel', 'error');
      }
    } catch (error) {
      toast('Lỗi hệ thống khi xử lý file', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addMilestone = () => {
    const newId = `m-${Math.random().toString(36).slice(2, 9)}`;
    onPatch({
      milestones: [
        ...state.milestones,
        {
          id: newId,
          title: `Đợt ${state.milestones.length + 1}`,
          description: '',
          plannedAmount: 0,
          releaseCondition: '',
          startDate: today,
          endDate: today,
          categories: [],
        },
      ],
    });
  };

  const addCategory = (milestoneId: string) => {
    const catId = `cat-${Math.random().toString(36).slice(2, 9)}`;
    onPatch({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? {
            ...m,
            categories: [
              ...(m.categories || []),
              {
                id: catId,
                name: '',
                description: '',
                balance: 0,
                items: [
                  {
                    id: `ci-${Math.random().toString(36).slice(2, 9)}`,
                    name: '',
                    expectedQuantity: 0,
                    actualQuantity: 0,
                    expectedPrice: 0,
                    actualPrice: 0,
                    unit: '',
                    brand: '',
                    purchaseLocation: '',
                    expectedPurchaseLink: '',
                    note: '',
                  },
                ],
              },
            ],
          }
          : m
      ),
    });
  };

  const addCategoryItem = (milestoneId: string, catId: string) => {
    const itemId = `ci-${Math.random().toString(36).slice(2, 9)}`;
    onPatch({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? {
            ...m,
            categories: (m.categories || []).map((c) =>
              c.id === catId
                ? {
                  ...c,
                  items: [
                    ...c.items,
                    {
                      id: itemId,
                      name: '',
                      expectedQuantity: 1,
                      actualQuantity: 0,
                      expectedPrice: 0,
                      actualPrice: 0,
                      unit: '',
                      brand: '',
                      purchaseLocation: '',
                      expectedPurchaseLink: '',
                      note: '',
                    },
                  ],
                }
                : c
            ),
          }
          : m
      ),
    });
  };

  const removeCategoryItem = (milestoneId: string, catId: string, itemId: string) => {
    onPatch({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? {
            ...m,
            categories: (m.categories || []).map((c) =>
              c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
            ),
          }
          : m
      ),
    });
  };

  const removeCategory = (milestoneId: string, catId: string) => {
    onPatch({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, categories: (m.categories || []).filter((c) => c.id !== catId) }
          : m
      ),
    });
  };

  const updateCategoryField = (milestoneId: string, catId: string, field: string, value: string) => {
    onPatch({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, categories: (m.categories || []).map((c) => (c.id === catId ? { ...c, [field]: value } : c)) }
          : m
      ),
    });
  };

  const updateCategoryItem = (milestoneId: string, catId: string, itemId: string, field: string, value: string | number) => {
    onPatch({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? {
            ...m,
            categories: (m.categories || []).map((c) =>
              c.id === catId
                ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)) }
                : c
            ),
          }
          : m
      ),
    });
  };

  const removeMilestone = (id: string) => {
    if (state.milestones.length <= 1) return;
    onPatch({
      milestones: state.milestones.filter((m) => m.id !== id),
    });
  };

  const getMilestoneErrorCount = (m: Milestone) => {
    let count = 0;
    if (!m.title.trim()) count += 1;
    if (!m.startDate || m.startDate < today) count += 1;
    if (!m.endDate || (m.startDate && m.endDate <= m.startDate)) count += 1;
    if (!m.categories || m.categories.length === 0) count += 1;
    (m.categories || []).forEach((cat) => {
      if (!cat.name.trim()) count += 1;
      if (!cat.items || cat.items.length === 0) count += 1;
      (cat.items || []).forEach((item) => {
        if (!item.name.trim()) count += 1;
        if (!item.expectedQuantity || item.expectedQuantity <= 0) count += 1;
        if (!item.expectedPrice || item.expectedPrice <= 0) count += 1;
      });
    });
    return count;
  };

  return (
    <div className="rounded-xl bg-white p-3.5 md:p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-black">Bước 3 — Lập kế hoạch chi tiêu</h2>
          <p className="mt-1 text-sm text-gray-500">
            Chia chiến dịch thành nhiều đợt giải ngân. Mỗi đợt liệt kê các hạng mục cần mua sắm.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Tải mẫu
          </button>
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isImporting ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            )}
            Nhập Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Tổng giải ngân */}
      <div className="mt-2.5">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-orange-50/80 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">Tổng giải ngân</p>
          <motion.span
            animate={{ color: milestonesOk ? '#059669' : '#dc2626' }}
            className="text-sm font-semibold tabular-nums"
          >
            {formatVnd(milestoneTotal)} / {formatVnd(target)} đ
          </motion.span>
        </div>
        {showErrors && !milestonesOk && (
          <p className="mt-1 text-xs font-semibold text-red-600">
            Tổng phân bổ các mốc ({formatVnd(milestoneTotal)}đ) phải bằng mục tiêu chiến dịch ({formatVnd(target)}đ).
          </p>
        )}
      </div>

      {/* Milestone cards */}
      <div className="space-y-2.5">
        {state.milestones.map((m, idx) => {
          const milSum = (m.categories || []).reduce((sum, cat) => {
            return sum + (cat.items || []).reduce((itemSum, item) => {
              return itemSum + (item.expectedPrice || 0) * (item.expectedQuantity || 0);
            }, 0);
          }, 0);
          const errorCount = getMilestoneErrorCount(m);
          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-visible rounded-xl border border-gray-200 bg-white"
            >
              <span className="absolute -left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-xs font-black text-brand shadow-sm">
                {idx + 1}
              </span>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-black">
                        Tên đợt <span className="text-red-500">*</span>
                      </p>
                      <div className="flex items-center gap-2">
                        {showErrors && errorCount > 0 && (
                          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                            {errorCount} lỗi
                          </span>
                        )}
                        <div className="text-xs font-bold text-brand tabular-nums">
                          Tổng: {formatVnd(milSum)} đ
                        </div>
                      </div>
                    </div>
                    <input
                      className={`${inCls} w-full font-semibold ${showErrors && !m.title.trim()
                          ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-100'
                          : ''
                        }`}
                      value={m.title}
                      placeholder="Ví dụ: Đợt 1 - Cứu trợ khẩn cấp"
                      spellCheck={false}
                      onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                    />
                    {showErrors && !m.title.trim() && (
                      <p className="text-xs font-semibold text-red-600">Vui lòng nhập tên đợt giải ngân.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={state.milestones.length <= 1}
                    onClick={() => removeMilestone(m.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 ring-1 ring-gray-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 disabled:cursor-not-allowed disabled:opacity-35 mt-[22px]"
                    aria-label="Xóa mốc"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">Ngày bắt đầu dự kiến <span className="text-red-500">*</span></p>
                    <input
                      type="date"
                      min={today}
                      className={`${inCls} w-full ${showErrors && (!m.startDate || m.startDate < today) ? 'border-red-300 bg-red-50/50' : ''}`}
                      value={m.startDate || ''}
                      onChange={(e) => updateMilestone(m.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">Ngày kết thúc dự kiến <span className="text-red-500">*</span></p>
                    <input
                      type="date"
                      min={m.startDate || today}
                      className={`${inCls} w-full ${showErrors && (!m.endDate || (m.startDate && m.endDate <= m.startDate)) ? 'border-red-300 bg-red-50/50' : ''}`}
                      value={m.endDate || ''}
                      onChange={(e) => updateMilestone(m.id, { endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">Mô tả đợt</p>
                    <textarea
                      className={`${inCls} w-full resize-none text-sm leading-relaxed`}
                      rows={2}
                      placeholder="Mục tiêu chính..."
                      value={m.description}
                      spellCheck={false}
                      onChange={(e) => updateMilestone(m.id, { description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-black">Điều kiện giải ngân</p>
                    <textarea
                      className={`${inCls} w-full resize-none text-sm leading-relaxed`}
                      rows={2}
                      placeholder="Ví dụ: Hoàn tất báo cáo đợt cũ..."
                      value={m.releaseCondition}
                      spellCheck={false}
                      onChange={(e) => updateMilestone(m.id, { releaseCondition: e.target.value })}
                    />
                  </div>
                </div>

                {/* Categories section — chỉ tên danh mục + số tiền */}
                <div className="mt-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Danh mục chi tiêu <span className="text-red-500">*</span></p>
                    <button
                      type="button"
                      onClick={() => addCategory(m.id)}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      + Thêm danh mục
                    </button>
                  </div>
                  {showErrors && (!m.categories || m.categories.length === 0) && (
                    <p className="text-xs font-semibold text-red-600">Cần ít nhất một danh mục chi tiêu cho mỗi đợt.</p>
                  )}

                  {(m.categories || []).map((cat) => {
                    const catNameMissing = showErrors && !cat.name.trim();
                    const catTotal = cat.items.reduce((sum, item) => sum + (item.expectedPrice || 0) * (item.expectedQuantity || 0), 0);

                    return (
                      <div key={cat.id} className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Tên danh mục</p>
                            <input
                              className={`${inCls} w-full py-1.5 text-sm font-semibold ${catNameMissing ? 'border-red-300 bg-red-50/50' : ''}`}
                              placeholder="Thực phẩm, Trang thiết bị..."
                              value={cat.name}
                              onChange={(e) => updateCategoryField(m.id, cat.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="w-40 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase text-right">Tổng danh mục</p>
                            <div className="flex items-center justify-end h-9 font-bold text-brand tabular-nums">
                              {formatVnd(catTotal)} đ
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCategory(m.id, cat.id)}
                            className="mt-5 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <TrashIcon />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Bảng hạng mục chi tiết</p>
                            <button
                              type="button"
                              onClick={() => addCategoryItem(m.id, cat.id)}
                              className="text-[10px] font-bold text-brand hover:underline"
                            >
                              + Thêm hạng mục
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                            <table className="w-full min-w-[700px] text-xs">
                              <thead>
                                <tr className="bg-gray-50 text-gray-400 border-bottom">
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200">Tên mặt hàng/Dịch vụ</th>
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200 w-24">Số lượng</th>
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200 w-24">Đơn vị</th>
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200 w-28">Đơn giá dự kiến</th>
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200 w-32">Nhãn hàng</th>
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200 w-32">Địa điểm mua</th>
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200 w-48">Link mua hàng</th>
                                  <th className="px-3 py-2 text-left font-bold border-b border-gray-200">Ghi chú</th>
                                  <th className="px-3 py-2 text-center font-bold border-b border-gray-200 w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {cat.items.map((item) => {
                                  const nameErr = showErrors && !item.name.trim();
                                  const qtyErr = showErrors && (!item.expectedQuantity || item.expectedQuantity <= 0);
                                  const priceErr = showErrors && (!item.expectedPrice || item.expectedPrice <= 0);

                                  return (
                                    <tr key={item.id}>
                                      <td className="px-2 py-1.5">
                                        <input
                                          className={`w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs font-semibold ${nameErr ? 'bg-red-50 text-red-600' : ''}`}
                                          placeholder="Tên mặt hàng..."
                                          value={item.name}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'name', e.target.value)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <input
                                          type="number"
                                          className={`w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs text-right tabular-nums ${qtyErr ? 'bg-red-50 text-red-600 font-bold' : ''}`}
                                          value={item.expectedQuantity}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'expectedQuantity', Number(e.target.value) || 0)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <input
                                          className="w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs text-center"
                                          placeholder="kg, chiếc..."
                                          value={item.unit}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'unit', e.target.value)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <input
                                          type="number"
                                          className={`w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs text-right font-semibold tabular-nums ${priceErr ? 'bg-red-50 text-red-600 font-bold' : ''}`}
                                          value={item.expectedPrice}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'expectedPrice', Number(e.target.value) || 0)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <input
                                          className="w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs"
                                          placeholder="Thương hiệu..."
                                          value={item.brand}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'brand', e.target.value)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <input
                                          className="w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs"
                                          placeholder="Chợ, siêu thị..."
                                          value={item.purchaseLocation}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'purchaseLocation', e.target.value)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <input
                                          className={`w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs ${item.expectedPurchaseLink && !URL_REGEX.test(item.expectedPurchaseLink) ? 'bg-red-50 text-red-600 font-bold' : 'text-blue-600 font-medium'}`}
                                          placeholder="https://..."
                                          value={item.expectedPurchaseLink || ''}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'expectedPurchaseLink', e.target.value)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <input
                                          className="w-full bg-transparent border-none focus:ring-0 px-1 py-1 text-xs text-gray-400"
                                          placeholder="..."
                                          value={item.note}
                                          onChange={(e) => updateCategoryItem(m.id, cat.id, item.id, 'note', e.target.value)}
                                        />
                                      </td>
                                      <td className="px-2 py-1.5 text-center">
                                        <button
                                          type="button"
                                          hidden={cat.items.length <= 1}
                                          onClick={() => removeCategoryItem(m.id, cat.id, item.id)}
                                          className="text-gray-400 hover:text-red-600 transition p-1"
                                        >
                                          <TrashIcon />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>


              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add milestone button */}
      <button
        type="button"
        onClick={addMilestone}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 py-2.5 text-sm font-semibold text-brand transition hover:bg-orange-50 sm:w-auto sm:px-5"
      >
        <span className="text-base leading-none">+</span> Thêm đợt
      </button>

      <StepFooter canNext={canNext} onPrev={onPrev} onNext={onNext} failMessage={failMessage} />
    </div>
  );
}
