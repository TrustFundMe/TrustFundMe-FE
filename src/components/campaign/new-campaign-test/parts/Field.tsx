'use client';

import { ReactNode, useId } from 'react';

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** Số ký tự hiện tại (để hiện counter). */
  valueLength?: number;
  /** Giới hạn ký tự để render counter `n / max`. */
  maxLength?: number;
  /** Render input/textarea/control. Nhận `id` + `aria-describedby` để gắn vào control. */
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
}

/**
 * Field — building block chuẩn cho mọi input trong wizard.
 *
 * - Label thường trực (không dùng placeholder làm label).
 * - Counter ký tự (tuỳ chọn, aria-hidden vì không cần đọc bằng SR).
 * - Helper text được liên kết qua `aria-describedby`.
 * - Error có `role="alert"` khi xuất hiện.
 *
 * Dùng:
 *   <Field label="Tên giai đoạn" required hint="Ngắn gọn, dưới 60 ký tự.">
 *     {(p) => <input {...p} className="..." />}
 *   </Field>
 */
export function Field({
  label,
  required = false,
  hint,
  error,
  valueLength,
  maxLength,
  children,
}: FieldProps) {
  const reactId = useId();
  const id = `field-${reactId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const showCounter = typeof valueLength === 'number' && typeof maxLength === 'number';

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-gray-800">
          {label}
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
        {showCounter ? (
          <span
            aria-hidden="true"
            className={`text-[11px] tabular-nums ${
              valueLength! > maxLength! ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {valueLength} / {maxLength}
          </span>
        ) : null}
      </div>

      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': !!error })}

      {hint ? (
        <p id={hintId} className="text-[11px] leading-snug text-gray-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-[11px] font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Class chuẩn cho input dùng chung trong wizard. */
export const FIELD_INPUT_CLS =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-gray-300 focus:border-brand focus:ring-2 focus:ring-orange-100 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-400 aria-[invalid=true]:focus:ring-red-100';

/** Class chuẩn cho textarea. */
export const FIELD_TEXTAREA_CLS =
  'w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-gray-300 focus:border-brand focus:ring-2 focus:ring-orange-100 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-400 aria-[invalid=true]:focus:ring-red-100';
