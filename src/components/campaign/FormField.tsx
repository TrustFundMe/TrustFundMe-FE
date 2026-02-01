'use client';

import type { ChangeEvent } from 'react';

export function Label({ children, htmlFor }: { children: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-gray-700">
      {children}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  id?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}{required ? ' *' : ''}</Label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  id?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}{required ? ' *' : ''}</Label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  id?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}{required ? ' *' : ''}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FileField({
  label,
  accept,
  file,
  onChange,
  helper,
  required,
}: {
  label: string;
  accept?: string;
  file: File | null;
  onChange: (f: File | null) => void;
  helper?: string;
  required?: boolean;
}) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onChange(f);
  };

  return (
    <div className="space-y-1">
      <Label>{label}{required ? ' *' : ''}</Label>
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4">
        <input type="file" accept={accept} onChange={handle} className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-700" />
        <div className="mt-2 text-xs text-gray-500">
          {file ? `Selected: ${file.name}` : helper || 'Choose a file from your device.'}
        </div>
      </div>
    </div>
  );
}
