'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { CampaignImage, NewCampaignTestState } from '../types';
import CategorySelector from '../parts/CategorySelector';

interface Props {
  state: NewCampaignTestState;
  errors: Record<string, string>;
  showErrors: boolean;
  onPatchCore: (patch: Partial<NewCampaignTestState['campaignCore']>) => void;
  onTogglePreview: () => void;
  previewOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function newImageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `img-${Math.random().toString(36).slice(2, 11)}`;
}

function inputClass(fieldKey: string, errors: Record<string, string>, showErrors: boolean) {
  const err = Boolean(showErrors && errors[fieldKey]);
  return [
    'w-full rounded-xl border-2 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition duration-150',
    err
      ? 'border-red-200 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-gray-200 bg-white focus:border-brand focus:bg-white focus:ring-2 focus:ring-orange-100',
  ].join(' ');
}

function UploadIcon() {
  return (
    <svg className="h-9 w-9 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M12 16V8m0 0l-3.5 3.5M12 8l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16.5A3.5 3.5 0 007.5 20h9A3.5 3.5 0 0020 16.5v-.04" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2.458 10C3.732 6.943 6.523 5 10 5s6.268 1.943 7.542 5c-1.274 3.057-4.065 5-7.542 5S3.732 13.057 2.458 10z" />
      <circle cx="10" cy="10" r="2" />
    </svg>
  );
}

export default function Step2CampaignForm({
  state,
  errors,
  showErrors,
  onPatchCore,
  onTogglePreview,
  previewOpen,
  onPrev,
  onNext,
}: Props) {
  const core = state.campaignCore;
  const images = core.campaignImages ?? [];
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverErr = showErrors && errors.coverImage;

  const applyImages = (nextImages: CampaignImage[], preferredCoverId?: string) => {
    const coverId =
      preferredCoverId && nextImages.some((i) => i.id === preferredCoverId)
        ? preferredCoverId
        : nextImages[0]?.id ?? '';
    const coverUrl = nextImages.find((i) => i.id === coverId)?.url ?? '';
    onPatchCore({
      campaignImages: nextImages,
      coverImageId: coverId,
      coverImageUrl: coverUrl,
    });
  };

  const appendFiles = (fileList: FileList | File[] | null) => {
    if (!fileList?.length) return;
    const list = Array.from(fileList as FileList);
    const additions: CampaignImage[] = [];
    for (const file of list) {
      if (!file.type.startsWith('image/')) continue;
      additions.push({ id: newImageId(), url: URL.createObjectURL(file), file });
    }
    if (!additions.length) return;
    const merged = [...images, ...additions];
    const nextCover =
      core.coverImageId && merged.some((i) => i.id === core.coverImageId) ? core.coverImageId : additions[0]!.id;
    applyImages(merged, nextCover);
  };

  const removeImage = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    const img = images.find((i) => i.id === id);
    if (img?.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
    const next = images.filter((i) => i.id !== id);
    applyImages(next, core.coverImageId === id ? undefined : core.coverImageId);
  };

  const setCover = (id: string) => {
    const url = images.find((i) => i.id === id)?.url ?? '';
    onPatchCore({ coverImageId: id, coverImageUrl: url });
  };

  const handleDrop: React.DragEventHandler = (e) => {
    e.preventDefault();
    setIsDragging(false);
    appendFiles(e.dataTransfer?.files ?? null);
  };

  const handleFileInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    appendFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800">Bước 2 — Nội dung chiến dịch</h2>
          <p className="mt-0.5 text-sm text-gray-500">Thông tin hiển thị công khai sau khi được duyệt.</p>
        </div>
        <motion.button
          type="button"
          onClick={onTogglePreview}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
            previewOpen ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          <EyeIcon />
          {previewOpen ? 'Đang xem trước' : 'Xem trước'}
        </motion.button>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,38%)] lg:items-start lg:gap-6">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tên chiến dịch" required error={errors.title} showErrors={showErrors}>
              <input
                className={inputClass('title', errors, showErrors)}
                value={core.title}
                onChange={(e) => onPatchCore({ title: e.target.value })}
              />
            </Field>
            <Field label="Số tiền mục tiêu (đ)" required error={errors.targetAmount} showErrors={showErrors}>
              <input
                type="number"
                className={inputClass('targetAmount', errors, showErrors)}
                value={core.targetAmount}
                onChange={(e) => onPatchCore({ targetAmount: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Ngày bắt đầu" required error={errors.startDate} showErrors={showErrors}>
              <input
                className={inputClass('startDate', errors, showErrors)}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={core.startDate}
                onChange={(e) => onPatchCore({ startDate: e.target.value })}
              />
            </Field>
            <Field label="Ngày kết thúc" required error={errors.endDate} showErrors={showErrors}>
              <input
                className={inputClass('endDate', errors, showErrors)}
                type="date"
                min={core.startDate || new Date().toISOString().split('T')[0]}
                value={core.endDate}
                onChange={(e) => onPatchCore({ endDate: e.target.value })}
              />
            </Field>
            <Field label="Danh mục" required error={errors.category} showErrors={showErrors}>
              <CategorySelector
                categoryId={core.categoryId}
                onChange={(id, name) => onPatchCore({ categoryId: id, category: name })}
                error={showErrors && errors.category}
              />
            </Field>
          </div>
          <Field label="Câu chuyện / mục tiêu gây quỹ" required error={errors.objective} showErrors={showErrors}>
            <textarea
              rows={4}
              className={`${inputClass('objective', errors, showErrors)} min-h-[100px] resize-y leading-relaxed`}
              value={core.objective}
              onChange={(e) => onPatchCore({ objective: e.target.value })}
            />
          </Field>

          <Field label="Lời cảm ơn nhà tài trợ" required error={errors.thankMessage} showErrors={showErrors}>
            <textarea
              rows={3}
              className={`${inputClass('thankMessage', errors, showErrors)} min-h-[76px] resize-y leading-relaxed`}
              value={core.thankMessage}
              onChange={(e) => onPatchCore({ thankMessage: e.target.value })}
            />
          </Field>
        </div>

        <div className={`mt-4 lg:mt-0 ${coverErr ? 'rounded-2xl ring-2 ring-red-200' : ''} lg:rounded-xl lg:bg-gray-50/60 lg:p-2.5 lg:ring-1 lg:ring-gray-100`}>
          <label className="mb-1.5 block text-sm font-semibold text-gray-800">
            Ảnh chiến dịch <span className="text-red-600">*</span>
          </label>
          <p className="mb-2 text-xs leading-snug text-gray-500">
            Thêm nhiều ảnh (16:9 khuyến nghị). Bấm &quot;Đặt làm bìa&quot; để chọn ảnh hiển thị trên thẻ chiến dịch.
          </p>

          {/* Large cover preview */}
          {images.length > 0 && core.coverImageUrl ? (
            <div className="relative mb-3 w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm ring-1 ring-gray-200">
              <div className="aspect-video w-full">
                <img src={core.coverImageUrl} alt="Ảnh bìa" className="h-full w-full object-cover" />
              </div>
              <span className="absolute left-2.5 top-2.5 rounded-full bg-brand/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                Bìa
              </span>
            </div>
          ) : null}

          {/* Thumbnails row */}
          {images.length > 0 ? (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-gutter:stable]">
              {images.map((img) => {
                const isCover = img.id === core.coverImageId;
                return (
                  <div
                    key={img.id}
                    className={`relative shrink-0 overflow-hidden rounded-lg bg-gray-200 ring-2 transition cursor-pointer ${
                      isCover ? 'ring-brand' : 'ring-transparent hover:ring-gray-300'
                    }`}
                    style={{ width: 80 }}
                    onClick={() => setCover(img.id)}
                  >
                    <div className="aspect-video w-full">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    {isCover ? (
                      <span className="absolute left-1 top-1 rounded-full bg-brand px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-white">
                        Bìa
                      </span>
                    ) : (
                      <div className="absolute inset-0 flex items-end justify-center pb-1">
                        <span className="rounded bg-black/40 px-1 py-0.5 text-[9px] font-medium text-white">
                          Chọn bìa
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id, e); }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Gỡ ảnh"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 2l10 10M12 2L2 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Drop zone */}
          <div
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-5 transition-all duration-200 ${
              coverErr && images.length === 0
                ? 'border-red-200 bg-red-50/50'
                : isDragging
                  ? 'border-brand bg-orange-50/70'
                  : 'border-gray-200 bg-white/80 hover:border-brand/50 hover:bg-orange-50/40'
            }`}
          >
            <UploadIcon />
            <p className="mt-1.5 px-2 text-center text-xs font-medium text-gray-600">
              {isDragging ? 'Thả ảnh vào đây' : images.length ? 'Thêm ảnh (kéo thả hoặc bấm)' : 'Kéo thả hoặc bấm để thêm ảnh'}
            </p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
          {coverErr ? <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.coverImage}</p> : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <motion.button
          type="button"
          onClick={onPrev}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
        >
          Quay lại
        </motion.button>
        <motion.button
          type="button"
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover active:scale-[0.98]"
        >
          Tiếp tục
        </motion.button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  error,
  showErrors,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  showErrors: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {showErrors && error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
