'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { NewCampaignTestState, Milestone, MilestoneCategory, MilestoneCategoryItem } from '../types';
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

function formatDateVi(date?: string): string {
  if (!date) return 'Chưa chọn';
  // Support yyyy-mm-dd input
  const parts = date.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Convert yyyy-mm-dd to dd/mm/yyyy for display */
function toViDate(iso?: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return iso;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function parseViDateToIso(value: string): string | null {
  const raw = value.trim();
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const dd = Number(match[1]);
  const mm = Number(match[2]);
  const yyyy = Number(match[3]);
  if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yyyy)) return null;
  if (yyyy < 1900 || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const date = new Date(yyyy, mm - 1, dd);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== yyyy ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return null;
  }
  return `${String(yyyy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function normalizeViDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function ViDateInput({
  value,
  onChangeIso,
  className,
  readOnly = false,
  onBlur,
  min,
}: {
  value?: string;
  onChangeIso?: (iso: string) => void;
  className?: string;
  readOnly?: boolean;
  onBlur?: () => void;
  min?: string;
}) {
  const [displayValue, setDisplayValue] = useState<string>(toViDate(value));
  const [isFocused, setIsFocused] = useState(false);
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused) return;
    setDisplayValue(toViDate(value));
  }, [value, isFocused]);

  const openNativePicker = () => {
    if (readOnly) return;
    hiddenDateRef.current?.showPicker?.();
    hiddenDateRef.current?.focus();
    hiddenDateRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/yyyy"
        readOnly={readOnly}
        className={className}
        value={displayValue}
        onChange={(e) => {
          if (readOnly) return;
          setDisplayValue(normalizeViDateInput(e.target.value));
        }}
        onFocus={(e) => {
          if (readOnly) return;
          setIsFocused(true);
          e.currentTarget.select();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
          const iso = parseViDateToIso(displayValue);
          if (iso && !readOnly) {
            onChangeIso?.(iso);
            setDisplayValue(toViDate(iso));
            return;
          }
          setDisplayValue(toViDate(value));
        }}
      />
      {!readOnly && (
        <>
          <button
            type="button"
            onClick={openNativePicker}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            tabIndex={-1}
            aria-label="Chọn ngày"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </button>
          <input
            ref={hiddenDateRef}
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
            tabIndex={-1}
            value={value || ""}
            min={min}
            onChange={(e) => {
              if (readOnly) return;
              const iso = e.target.value;
              if (iso) {
                onChangeIso?.(iso);
                setDisplayValue(toViDate(iso));
              }
            }}
          />
        </>
      )}
    </div>
  );
}

export default function Step3Milestones({ state, milestoneTotal, onPatch, onPrev, onNext, canNext, showErrors, failMessage }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const campaignStart = state.campaignCore.startDate;
  const campaignEnd = state.campaignCore.endDate;

  useEffect(() => {
    if (!state.milestones.length) return;
    let previousEndDate = '';
    let changed = false;
    const nextMilestones = state.milestones.map((m, idx) => {
      if (idx === 0) {
        previousEndDate = m.endDate || '';
        return m;
      }
      const expectedStart = previousEndDate || '';
      previousEndDate = m.endDate || '';
      if (!expectedStart || m.startDate === expectedStart) return m;
      changed = true;
      return { ...m, startDate: expectedStart };
    });
    if (changed) onPatch({ milestones: nextMilestones });
  }, [state.milestones, onPatch]);

  const updateMilestone = (id: string, patch: Partial<Milestone>) => {
    onPatch({ milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  };

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(state.milestones[0]?.id || '');
  const [pendingDeleteMilestoneId, setPendingDeleteMilestoneId] = useState<string | null>(null);
  const [categoryDetailModal, setCategoryDetailModal] = useState<{
    milestoneId: string;
    categoryId: string;
  } | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'categories'>('info');
  const [touchedMilestones, setTouchedMilestones] = useState<Record<string, boolean>>({});
  const [touchedCategories, setTouchedCategories] = useState<Record<string, boolean>>({});
  const prevActiveMilestoneIdRef = useRef<string>('');

  const markMilestoneTouched = (milestoneId: string) => {
    if (!milestoneId) return;
    setTouchedMilestones((prev) => ({ ...prev, [milestoneId]: true }));
  };

  const markCategoryTouched = (categoryId: string) => {
    if (!categoryId) return;
    setTouchedCategories((prev) => ({ ...prev, [categoryId]: true }));
  };

  useEffect(() => {
    if (!state.milestones.length) {
      setActiveMilestoneId('');
      return;
    }
    if (!state.milestones.some((m) => m.id === activeMilestoneId)) {
      setActiveMilestoneId(state.milestones[0].id);
    }
  }, [state.milestones, activeMilestoneId]);

  useEffect(() => {
    const prev = prevActiveMilestoneIdRef.current;
    if (prev && prev !== activeMilestoneId) markMilestoneTouched(prev);
    prevActiveMilestoneIdRef.current = activeMilestoneId;
  }, [activeMilestoneId]);

  const activeMilestone = useMemo(
    () => state.milestones.find((m) => m.id === activeMilestoneId) ?? state.milestones[0] ?? null,
    [state.milestones, activeMilestoneId],
  );

  useEffect(() => {
    if (!categoryDetailModal) return;
    const ms = state.milestones.find((m) => m.id === categoryDetailModal.milestoneId);
    const catExists = ms?.categories?.some((c) => c.id === categoryDetailModal.categoryId);
    if (!ms || !catExists) setCategoryDetailModal(null);
  }, [state.milestones, categoryDetailModal]);

  useEffect(() => {
    if (!categoryDetailModal) return;
    if (activeMilestoneId !== categoryDetailModal.milestoneId) setCategoryDetailModal(null);
  }, [activeMilestoneId, categoryDetailModal]);

  useEffect(() => {
    if (!categoryDetailModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCategoryDetailModal(null);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [categoryDetailModal]);

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
          evidenceDueAt: formatDateForInput(m.evidenceDueAt),
          startDate: formatDateForInput(m.startDate),
          endDate: formatDateForInput(m.endDate),
          categories: (m.categories || []).map((cat: any) => ({
            id: `cat-${Math.random().toString(36).slice(2, 9)}`,
            name: cat.name,
            description: '',
            balance: 0,
            items: (cat.items || []).map((item: any) => ({
              id: `ci-${Math.random().toString(36).slice(2, 9)}`,
              name: item.name || '',
              expectedQuantity: item.expectedQuantity || 0,
              actualQuantity: 0,
              expectedPrice: item.expectedPrice || 0,
              actualPrice: 0,
              expectedUnit: item.expectedUnit || '',
              expectedBrand: item.expectedBrand || '',
              expectedPurchaseLocation: item.expectedPurchaseLocation || '',
              expectedPurchaseLink: item.expectedPurchaseLink || '',
              expectedNote: item.expectedNote || ''
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
    const previousMilestone = state.milestones[state.milestones.length - 1];
    const autoStartDate = previousMilestone ? (previousMilestone.endDate || today) : today;
    onPatch({
      milestones: [
        ...state.milestones,
        {
          id: newId,
          title: `Đợt ${state.milestones.length + 1}`,
          description: '',
          plannedAmount: 0,
          evidenceDueAt: autoStartDate,
          startDate: autoStartDate,
          endDate: autoStartDate,
          categories: [],
        },
      ],
    });
    setActiveMilestoneId(newId);
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
                    expectedUnit: '',
                    expectedBrand: '',
                    expectedPurchaseLocation: '',
                    expectedPurchaseLink: '',
                    expectedNote: '',
                  },
                ],
              },
            ],
          }
          : m
      ),
    });
    if (activeMilestoneId === milestoneId) {
      setCategoryDetailModal({ milestoneId, categoryId: catId });
    }
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
                      expectedUnit: '',
                      expectedBrand: '',
                      expectedPurchaseLocation: '',
                      expectedPurchaseLink: '',
                      expectedNote: '',
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
    if (categoryDetailModal?.milestoneId === milestoneId && categoryDetailModal?.categoryId === catId) {
      setCategoryDetailModal(null);
    }
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
    onPatch({
      milestones: state.milestones.filter((m) => m.id !== id),
    });
    if (activeMilestoneId === id) {
      const next = state.milestones.find((m) => m.id !== id);
      setActiveMilestoneId(next?.id || '');
    }
  };

  const pendingDeleteMilestone = pendingDeleteMilestoneId
    ? state.milestones.find((m) => m.id === pendingDeleteMilestoneId) ?? null
    : null;

  const openDeleteMilestoneConfirm = (id: string) => {
    setPendingDeleteMilestoneId(id);
  };

  const closeDeleteMilestoneConfirm = () => {
    setPendingDeleteMilestoneId(null);
  };

  const confirmDeleteMilestone = () => {
    if (!pendingDeleteMilestoneId) return;
    removeMilestone(pendingDeleteMilestoneId);
    setPendingDeleteMilestoneId(null);
  };

  const getMilestoneComputedTotal = (m: Milestone) => {
    return (m.categories || []).reduce((sum, cat) => {
      return sum + (cat.items || []).reduce((itemSum, item) => itemSum + (item.expectedPrice || 0) * (item.expectedQuantity || 0), 0);
    }, 0);
  };

  const getItemTotal = (item: MilestoneCategoryItem) => (item.expectedPrice || 0) * (item.expectedQuantity || 0);

  const getMilestoneErrorCount = (m: Milestone) => {
    const milestoneIndex = state.milestones.findIndex((x) => x.id === m.id);
    const prev = milestoneIndex > 0 ? state.milestones[milestoneIndex - 1] : null;
    let count = 0;
    if (!(m.title?.trim())) count += 1;
    if (!m.startDate) count += 1;
    if (milestoneIndex > 0) {
      const expectedStart = prev?.endDate || '';
      if (expectedStart && m.startDate !== expectedStart) count += 1;
    }
    if (!m.endDate || (m.startDate && m.endDate <= m.startDate)) count += 1;
    if (m.endDate && m.evidenceDueAt && m.evidenceDueAt <= m.endDate) count += 1;
    if (!m.evidenceDueAt) count += 1;
    if (!m.categories || m.categories.length === 0) count += 1;
    (m.categories || []).forEach((cat) => {
      if (!(cat.name?.trim())) count += 1;
      if (!cat.items || cat.items.length === 0) count += 1;
      (cat.items || []).forEach((item) => {
        if (!(item.name?.trim())) count += 1;
        if (!item.expectedQuantity || item.expectedQuantity <= 0) count += 1;
        if (!item.expectedPrice || item.expectedPrice <= 0) count += 1;
      });
    });
    return count;
  };

  const getCategoryErrorCount = (cat: MilestoneCategory) => {
    let count = 0;
    if (!(cat.name?.trim())) count += 1;
    if (!cat.items || cat.items.length === 0) count += 1;
    (cat.items || []).forEach((item) => {
      if (!(item.name?.trim())) count += 1;
      if (!item.expectedQuantity || item.expectedQuantity <= 0) count += 1;
      if (!item.expectedPrice || item.expectedPrice <= 0) count += 1;
      if (item.expectedPurchaseLink?.trim() && !URL_REGEX.test(item.expectedPurchaseLink)) count += 1;
    });
    return count;
  };

  const getMilestoneIssues = (m: Milestone) => {
    const milestoneIndex = state.milestones.findIndex((x) => x.id === m.id);
    const prev = milestoneIndex > 0 ? state.milestones[milestoneIndex - 1] : null;
    const issues: string[] = [];
    if (!(m.title?.trim())) issues.push('Thiếu tên đợt giải ngân');
    if (!m.startDate) issues.push('Thiếu ngày bắt đầu đợt');
    if (milestoneIndex > 0) {
      const expectedStart = prev?.endDate || '';
      if (expectedStart && m.startDate && m.startDate !== expectedStart) issues.push('Ngày bắt đầu đợt phải nối tiếp từ ngày kết thúc đợt trước');
    }
    if (!m.endDate || (m.startDate && m.endDate <= m.startDate)) issues.push('Ngày kết thúc phải sau ngày bắt đầu');
    if (m.endDate && m.evidenceDueAt && m.evidenceDueAt <= m.endDate) issues.push('Ngày nộp minh chứng phải sau ngày kết thúc đợt');
    if (!m.evidenceDueAt) issues.push('Thiếu ngày nộp minh chứng');
    if (!m.categories || m.categories.length === 0) issues.push('Chưa có danh mục chi tiêu');
    (m.categories || []).forEach((cat, catIdx) => {
      if (!(cat.name?.trim())) issues.push(`Danh mục ${catIdx + 1}: thiếu tên danh mục`);
      if (!cat.items || cat.items.length === 0) issues.push(`Danh mục ${catIdx + 1}: chưa có hạng mục`);
      (cat.items || []).forEach((item, itemIdx) => {
        if (!(item.name?.trim())) issues.push(`Danh mục ${catIdx + 1}, hạng mục ${itemIdx + 1}: thiếu tên mặt hàng`);
        if (!item.expectedQuantity || item.expectedQuantity <= 0) issues.push(`Danh mục ${catIdx + 1}, hạng mục ${itemIdx + 1}: số lượng phải > 0`);
        if (!item.expectedPrice || item.expectedPrice <= 0) issues.push(`Danh mục ${catIdx + 1}, hạng mục ${itemIdx + 1}: đơn giá phải > 0`);
      });
    });
    return issues;
  };

  const dm = categoryDetailModal;
  const modalMilestone =
    dm != null ? state.milestones.find((m) => m.id === dm.milestoneId) ?? null : null;
  const modalCategory =
    modalMilestone != null ? (modalMilestone.categories || []).find((c) => c.id === dm?.categoryId) : undefined;
  const modalCatIdx =
    modalMilestone != null && modalCategory != null
      ? (modalMilestone.categories || []).findIndex((c) => c.id === modalCategory.id)
      : -1;

  return (
    <div className="rounded-xl bg-white p-2 md:p-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-black">Bước 3 — Lập kế hoạch chi tiêu</h2>
          <p className="mt-0.5 text-sm text-gray-500">
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

      {/* Tổng quan nhanh */}
      <div className="mt-2">
        <div className="mb-2 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-orange-200 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-amber-700">Mục tiêu (tự tính)</span>
            <span className={`text-sm font-bold tabular-nums ${milestoneTotal > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatVnd(milestoneTotal)} đ
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Bắt đầu quyên góp</span>
            <span className="text-sm font-semibold text-black">{formatDateVi(campaignStart)}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Kết thúc quyên góp</span>
            <span className="text-sm font-semibold text-black">{formatDateVi(campaignEnd)}</span>
          </div>
        </div>
      </div>

      {/* Master-detail cho đợt giải ngân */}
      <div className="mt-1 grid gap-2 lg:grid-cols-12">
        <div className="max-h-[68dvh] space-y-1.5 overflow-y-auto pr-1 lg:col-span-4">
          {state.milestones.map((m, idx) => {
            const isActive = activeMilestone?.id === m.id;
            const errorCount = getMilestoneErrorCount(m);
            const issues = getMilestoneIssues(m);
            const mTotal = getMilestoneComputedTotal(m);
            const shouldValidateMilestone = Boolean(showErrors) || Boolean(touchedMilestones[m.id]);
            const hasMilestoneErrors = shouldValidateMilestone && errorCount > 0;
            return (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveMilestoneId(m.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveMilestoneId(m.id);
                  }
                }}
                className={`w-full rounded-lg border px-2.5 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${shouldValidateMilestone && errorCount > 0
                  ? 'border-red-300 bg-red-50/40'
                  : isActive
                    ? 'border-orange-300 bg-orange-50/70 ring-1 ring-orange-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-black">Đợt {idx + 1}</p>
                      {isActive && (
                        <span className="rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-800">
                          Đang chỉnh
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-bold leading-tight text-black">{m.title || `Đợt ${idx + 1}`}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`text-xs font-bold tabular-nums ${hasMilestoneErrors ? 'text-red-600' : 'text-brand'}`}>
                      {formatVnd(mTotal)} đ
                    </span>
                    {hasMilestoneErrors && (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                        Còn {errorCount} mục cần điền
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteMilestoneConfirm(m.id);
                      }}
                      className="rounded-md border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] font-medium leading-snug text-black">
                  <span className="text-gray-600">{m.startDate ? formatDateVi(m.startDate) : '—'} → {m.endDate ? formatDateVi(m.endDate) : '—'}</span>
                  <span>• {(m.categories || []).length} danh mục</span>
                </div>
                {hasMilestoneErrors && issues.length > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-red-700">
                    {issues[0]}
                  </p>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={addMilestone}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-orange-200 bg-orange-50/40 py-2 text-xs font-semibold text-brand transition hover:bg-orange-50"
          >
            <span className="text-sm leading-none">+</span> Thêm đợt
          </button>
        </div>

        <div className="lg:col-span-8">
          {activeMilestone ? (
            <div
              key={activeMilestone.id}
              className="rounded-xl border border-gray-200 bg-white p-3.5"
            >
              <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('info')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeDetailTab === 'info' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                >
                  Thông tin đợt
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('categories')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeDetailTab === 'categories' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                >
                  Danh mục chi tiêu
                </button>
              </div>
              {showErrors && (!activeMilestone.categories || activeMilestone.categories.length === 0) && (
                <div className="mb-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs font-bold text-red-700">
                    Bạn phải thêm ít nhất 1 danh mục chi tiêu cho đợt này.
                  </p>
                </div>
              )}

              {activeDetailTab === 'info' && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                  {(() => {
                    const shouldValidateMilestone = Boolean(showErrors) || Boolean(touchedMilestones[activeMilestone.id]);
                    const invalidDateRange = Boolean(
                      activeMilestone.startDate &&
                      activeMilestone.endDate &&
                      activeMilestone.endDate <= activeMilestone.startDate
                    );
                    const invalidEvidenceDate = Boolean(
                      activeMilestone.endDate &&
                      activeMilestone.evidenceDueAt &&
                      activeMilestone.evidenceDueAt <= activeMilestone.endDate
                    );
                    return (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold text-black">Thông tin đợt giải ngân</p>
                            <input
                              className={`${inCls} w-full font-semibold ${touchedMilestones[activeMilestone.id] && !activeMilestone.title?.trim() ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-100' : ''}`}
                              value={activeMilestone.title || ''}
                              placeholder="Ví dụ: Đợt 1 - Cứu trợ khẩn cấp"
                              spellCheck={false}
                              onBlur={() => markMilestoneTouched(activeMilestone.id)}
                              onChange={(e) => updateMilestone(activeMilestone.id, { title: e.target.value })}
                            />
                          </div>
                          <button
                            type="button"
                    onClick={() => openDeleteMilestoneConfirm(activeMilestone.id)}
                            className="mt-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 ring-1 ring-gray-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Xóa mốc"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        {touchedMilestones[activeMilestone.id] && !activeMilestone.title?.trim() && <p className="mt-1 text-xs font-semibold text-red-600">Vui lòng nhập tên đợt giải ngân.</p>}

                        <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
                          {(() => {
                            const isFirstMilestone = state.milestones[0]?.id === activeMilestone.id;
                            return (
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-black">
                                  {isFirstMilestone ? <>Ngày bắt đầu đợt <span className="text-red-500">*</span></> : 'Ngày bắt đầu đợt (tự động)'}
                                </p>
                                <ViDateInput
                                  readOnly={!isFirstMilestone}
                                  className={`${inCls} w-full ${!isFirstMilestone ? 'bg-gray-100 text-gray-600' : ''} ${touchedMilestones[activeMilestone.id] && !activeMilestone.startDate ? 'border-red-300 bg-red-50/50 text-red-700' : ''}`}
                                  value={activeMilestone.startDate || ''}
                                  onBlur={() => markMilestoneTouched(activeMilestone.id)}
                                  onChangeIso={isFirstMilestone ? (iso) => updateMilestone(activeMilestone.id, { startDate: iso }) : undefined}
                                />
                                <p className="text-[11px] font-medium text-gray-500">
                                  {isFirstMilestone
                                    ? 'Ngày bắt đầu đợt 1 sẽ là ngày bắt đầu chiến dịch.'
                                    : 'Tự động nối tiếp từ ngày kết thúc đợt trước.'}
                                </p>
                              </div>
                            );
                          })()}

                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-black">Ngày kết thúc dự kiến <span className="text-red-500">*</span></p>
                            <ViDateInput
                              min={activeMilestone.startDate || today}
                              className={`${inCls} w-full ${(touchedMilestones[activeMilestone.id] && (!activeMilestone.endDate || (activeMilestone.evidenceDueAt && activeMilestone.evidenceDueAt <= activeMilestone.endDate))) || invalidDateRange ? 'border-red-300 bg-red-50/50' : ''}`}
                              value={activeMilestone.endDate || ''}
                              onBlur={() => markMilestoneTouched(activeMilestone.id)}
                              onChangeIso={(iso) => updateMilestone(activeMilestone.id, { endDate: iso })}
                            />
                            {invalidDateRange && (
                              <p className="mt-1 text-xs font-semibold text-red-600">
                                Ngày kết thúc phải sau ngày bắt đầu.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-black">Ngày nộp minh chứng <span className="text-red-500">*</span></p>
                            <ViDateInput
                              min={activeMilestone.endDate || today}
                              className={`${inCls} w-full ${(touchedMilestones[activeMilestone.id] && !activeMilestone.evidenceDueAt) || invalidEvidenceDate ? 'border-red-300 bg-red-50/50 text-red-700' : ''}`}
                              value={activeMilestone.evidenceDueAt || ''}
                              onBlur={() => markMilestoneTouched(activeMilestone.id)}
                              onChangeIso={(iso) => updateMilestone(activeMilestone.id, { evidenceDueAt: iso })}
                            />
                            {invalidEvidenceDate && (
                              <p className="mt-1 text-xs font-semibold text-red-600">
                                Ngày nộp minh chứng phải sau ngày kết thúc.
                              </p>
                            )}
                            <p className="text-[11px] font-medium text-gray-500">
                              {state.milestones[state.milestones.length - 1]?.id === activeMilestone.id
                                ? 'Đợt cuối: ngày này sẽ là ngày kết thúc chiến dịch.'
                                : 'Hạn chót nộp chứng từ cho đợt này.'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-black">Mô tả đợt</p>
                            <textarea
                              className={`${inCls} w-full resize-none text-sm leading-relaxed`}
                              rows={2}
                              placeholder="Mục tiêu chính..."
                              value={activeMilestone.description || ''}
                              spellCheck={false}
                              onBlur={() => markMilestoneTouched(activeMilestone.id)}
                              onChange={(e) => updateMilestone(activeMilestone.id, { description: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {activeDetailTab === 'categories' && (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-base font-semibold text-black">Danh mục chi tiêu <span className="text-red-500">*</span></p>
                    <button type="button" onClick={() => addCategory(activeMilestone.id)} className="text-xs font-semibold text-brand hover:underline">
                      + Thêm danh mục
                    </button>
                  </div>
                  <p className="mb-2 text-xs font-semibold text-red-600">Các trường có dấu * là bắt buộc.</p>
                  {showErrors && (
                    <div className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2.5">
                      <p className="text-sm font-bold text-red-700">Các lỗi cần sửa trong bước này:</p>
                      <ul className="mt-1 list-disc pl-5 text-xs font-semibold text-red-700">
                        {getMilestoneIssues(activeMilestone).slice(0, 8).map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="max-h-[68dvh] space-y-3 overflow-y-auto pr-1">
                    {showErrors && (!activeMilestone.categories || activeMilestone.categories.length === 0) && (
                      <p className="text-xs font-semibold text-red-600">Cần ít nhất một danh mục chi tiêu cho mỗi đợt.</p>
                    )}

                    {(activeMilestone.categories || []).map((cat, catIdx) => {
                      const shouldValidateCategory = Boolean(showErrors) || Boolean(touchedCategories[cat.id]);
                      const catNameMissing = shouldValidateCategory && !cat.name?.trim();
                      const catTotal = cat.items.reduce((sum, item) => sum + getItemTotal(item), 0);
                      const catErrorCount = getCategoryErrorCount(cat);
                      const isModalThis =
                        categoryDetailModal?.milestoneId === activeMilestone.id &&
                        categoryDetailModal?.categoryId === cat.id;
                      return (
                        <div key={cat.id} className={`rounded-xl border bg-white ${shouldValidateCategory && catErrorCount > 0
                          ? 'border-red-300 bg-red-50/30'
                          : isModalThis
                            ? 'border-black ring-2 ring-black/15'
                            : 'border-gray-300'
                          }`}>
                          <div className="border-b border-gray-200 p-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-black">Danh mục:</p>
                                  <p className="text-sm font-bold text-black">{catIdx + 1}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-black">Tổng tiền danh mục này:</p>
                                  <p className="text-sm font-bold tabular-nums text-brand">{formatVnd(catTotal)} đ</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="shrink-0 self-center text-sm font-semibold text-black">Tên danh mục <span className="text-red-500">*</span>:</p>
                                <input
                                  className={`${inCls} w-full py-1.5 text-sm font-semibold ${catNameMissing ? 'border-red-300 bg-red-50/50' : ''}`}
                                  placeholder={`Nhập tên danh mục ${catIdx + 1}`}
                                  value={cat.name || ''}
                                  onBlur={() => markCategoryTouched(cat.id)}
                                  onChange={(e) => updateCategoryField(activeMilestone.id, cat.id, 'name', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                              {isModalThis && (
                                <span className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-800">
                                  Đang chỉnh
                                </span>
                              )}
                              {shouldValidateCategory && catErrorCount > 0 && (
                                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
                                  Còn {catErrorCount} mục cần điền
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setCategoryDetailModal({ milestoneId: activeMilestone.id, categoryId: cat.id })
                                }
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-100"
                              >
                                Xem chi tiết
                              </button>
                              <button type="button" onClick={() => removeCategory(activeMilestone.id, cat.id)} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700">
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {dm && modalMilestone && modalCategory && modalCatIdx >= 0 ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onClick={() => setCategoryDetailModal(null)}
        >
          <div className="absolute inset-0 bg-black/45" aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-detail-modal-title"
            className="relative z-10 flex max-h-[min(90dvh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div className="min-w-0">
                <p id="category-detail-modal-title" className="text-base font-bold text-black">
                  Danh mục {modalCatIdx + 1}
                  {modalCategory.name?.trim()
                    ? ` — ${modalCategory.name.trim()}`
                    : ': chưa đặt tên'}
                </p>
                <div className="mt-2">
                  <p className="mb-1 text-xs font-semibold text-black">
                    Tên danh mục <span className="text-red-500">*</span>
                  </p>
                  <input
                    className={`${inCls} w-full py-1.5 text-sm font-semibold ${showErrors && !modalCategory.name?.trim() ? 'border-red-300 bg-red-50/50' : ''}`}
                    placeholder={`Nhập tên danh mục ${modalCatIdx + 1}`}
                    value={modalCategory.name || ''}
                    onChange={(e) => updateCategoryField(modalMilestone.id, modalCategory.id, 'name', e.target.value)}
                  />
                </div>
                <p className="mt-1 text-sm font-semibold tabular-nums text-brand">
                  Tổng tiền danh mục này: {formatVnd(modalCategory.items.reduce((s, it) => s + getItemTotal(it), 0))} đ
                </p>

              </div>
              <button
                type="button"
                onClick={() => setCategoryDetailModal(null)}
                className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <details open className="rounded-lg border border-gray-200 bg-white p-2.5">
                <summary className="cursor-pointer text-sm font-semibold text-black">Hạng mục trong danh mục</summary>
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => addCategoryItem(modalMilestone.id, modalCategory.id)}
                    className="text-[10px] font-bold text-brand hover:underline"
                  >
                    + Thêm hạng mục
                  </button>
                </div>
                <div className="mt-2 space-y-2.5">
                  {modalCategory.items.map((item, itemIdx) => {
                    const shouldValidateCategory = Boolean(showErrors) || Boolean(touchedCategories[modalCategory.id]);
                    const nameErr = shouldValidateCategory && !item.name?.trim();
                    const qtyErr = shouldValidateCategory && (!item.expectedQuantity || item.expectedQuantity <= 0);
                    const priceErr = shouldValidateCategory && (!item.expectedPrice || item.expectedPrice <= 0);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-3 ${itemIdx % 2 === 0 ? 'border-gray-300 bg-white' : 'border-slate-300 bg-slate-50/60'
                          } border-l-4 border-l-brand/70`}
                      >
                        <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-1.5">
                          <p className="text-xs font-bold text-black">Hạng mục {itemIdx + 1}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-700">
                              Thành tiền:{' '}
                              <span className="font-bold text-brand tabular-nums">{formatVnd(getItemTotal(item))} đ</span>
                            </p>
                            <button
                              type="button"
                              hidden={modalCategory.items.length <= 1}
                              onClick={() => removeCategoryItem(modalMilestone.id, modalCategory.id, item.id)}
                              className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-2.5 md:grid-cols-12">
                          <div className="md:col-span-6">
                            <p className="mb-1 text-[11px] font-semibold text-black">
                              Tên mặt hàng <span className="text-red-500">*</span>
                            </p>
                            <input
                              className={`${inCls} w-full ${nameErr ? 'border-red-300 bg-red-50/50' : ''}`}
                              placeholder="Gạo cứu trợ, áo ấm, thuốc..."
                              value={item.name || ''}
                              onBlur={() => markCategoryTouched(modalCategory.id)}
                              onChange={(e) =>
                                updateCategoryItem(modalMilestone.id, modalCategory.id, item.id, 'name', e.target.value)
                              }
                            />
                          </div>
                          <div className="md:col-span-3">
                            <p className="mb-1 text-[11px] font-semibold text-black">
                              Số lượng <span className="text-red-500">*</span>
                            </p>
                            <input
                              type="number"
                              className={`${inCls} w-full text-right tabular-nums ${qtyErr ? 'border-red-300 bg-red-50/50' : ''}`}
                              value={item.expectedQuantity ?? 0}
                              onBlur={() => markCategoryTouched(modalCategory.id)}
                              onChange={(e) =>
                                updateCategoryItem(
                                  modalMilestone.id,
                                  modalCategory.id,
                                  item.id,
                                  'expectedQuantity',
                                  Number(e.target.value) || 0,
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-3">
                            <p className="mb-1 text-[11px] font-semibold text-black">
                              Đơn giá dự kiến <span className="text-red-500">*</span>
                            </p>
                            <input
                              type="number"
                              className={`${inCls} w-full text-right tabular-nums ${priceErr ? 'border-red-300 bg-red-50/50' : ''}`}
                              value={item.expectedPrice ?? 0}
                              onBlur={() => markCategoryTouched(modalCategory.id)}
                              onChange={(e) =>
                                updateCategoryItem(
                                  modalMilestone.id,
                                  modalCategory.id,
                                  item.id,
                                  'expectedPrice',
                                  Number(e.target.value) || 0,
                                )
                              }
                            />
                          </div>
                        </div>
                        <details className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                          <summary className="cursor-pointer text-xs font-semibold text-black">Thông tin bổ sung cần điền</summary>
                          <div className="mt-2 grid gap-2.5 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-[11px] font-semibold text-black">Đơn vị</p>
                              <input
                                className={inCls}
                                placeholder="bao, chiếc..."
                                value={item.expectedUnit || ''}
                                onBlur={() => markCategoryTouched(modalCategory.id)}
                                onChange={(e) =>
                                  updateCategoryItem(modalMilestone.id, modalCategory.id, item.id, 'expectedUnit', e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <p className="mb-1 text-[11px] font-semibold text-black">Nhãn hàng</p>
                              <input
                                className={inCls}
                                placeholder="Tên nhãn hàng"
                                value={item.expectedBrand || ''}
                                onBlur={() => markCategoryTouched(modalCategory.id)}
                                onChange={(e) =>
                                  updateCategoryItem(modalMilestone.id, modalCategory.id, item.id, 'expectedBrand', e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <p className="mb-1 text-[11px] font-semibold text-black">Địa điểm mua</p>
                              <input
                                className={inCls}
                                placeholder="Chợ, siêu thị..."
                                value={item.expectedPurchaseLocation || ''}
                                onBlur={() => markCategoryTouched(modalCategory.id)}
                                onChange={(e) =>
                                  updateCategoryItem(
                                    modalMilestone.id,
                                    modalCategory.id,
                                    item.id,
                                    'expectedPurchaseLocation',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <p className="mb-1 text-[11px] font-semibold text-black">Link mua hàng</p>
                              <input
                                className={`${inCls} ${item.expectedPurchaseLink && !URL_REGEX.test(item.expectedPurchaseLink)
                                  ? 'border-red-300 bg-red-50/50 text-red-600 font-semibold'
                                  : ''
                                  }`}
                                placeholder="https://..."
                                value={item.expectedPurchaseLink || ''}
                                onBlur={() => markCategoryTouched(modalCategory.id)}
                                onChange={(e) =>
                                  updateCategoryItem(
                                    modalMilestone.id,
                                    modalCategory.id,
                                    item.id,
                                    'expectedPurchaseLink',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="md:col-span-2">
                              <p className="mb-1 text-[11px] font-semibold text-black">Ghi chú</p>
                              <textarea
                                className={`${inCls} w-full resize-none`}
                                rows={2}
                                placeholder="Ghi chú thêm cho item"
                                value={item.expectedNote || ''}
                                onBlur={() => markCategoryTouched(modalCategory.id)}
                                onChange={(e) =>
                                  updateCategoryItem(modalMilestone.id, modalCategory.id, item.id, 'expectedNote', e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
              <button
                type="button"
                onClick={() => setCategoryDetailModal(null)}
                className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDeleteMilestone ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onClick={closeDeleteMilestoneConfirm}
        >
          <div className="absolute inset-0 bg-black/45" aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-milestone-title"
            className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-4 py-3">
              <p id="confirm-delete-milestone-title" className="text-base font-bold text-black">
                Bạn có muốn xóa đợt này không?
              </p>
            </div>
            <div className="px-4 py-3 text-sm text-gray-700">
              {pendingDeleteMilestone.title?.trim()
                ? `Đợt sẽ bị xóa: ${pendingDeleteMilestone.title}`
                : 'Đợt này chưa có tên, nhưng toàn bộ dữ liệu bên trong sẽ bị xóa.'}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
              <button
                type="button"
                onClick={closeDeleteMilestoneConfirm}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteMilestone}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Xóa đợt
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <StepFooter canNext={canNext} onPrev={onPrev} onNext={onNext} failMessage={failMessage} />
    </div>
  );
}
