'use client';

import { useEffect, useRef, useState } from 'react';
import { campaignCategoryService } from '@/services/campaignCategoryService';
import type { CampaignCategory } from '@/types/campaign';

interface Props {
  categoryId?: number;
  onChange: (id: number, name: string) => void;
  error?: string | boolean;
}

function CategorySkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 animate-pulse">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-4 flex-1 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function CategorySelector({ categoryId, onChange, error }: Props) {
  const [categories, setCategories] = useState<CampaignCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await campaignCategoryService.getAll();
        setCategories(data);
      } catch {
        console.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = categories.find((c) => c.id === categoryId);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !loading && setOpen((o) => !o)}
        disabled={loading}
        className={`flex w-full min-h-[44px] items-center justify-between rounded-xl border-2 bg-white px-4 py-2.5 text-left text-sm shadow-sm outline-none transition ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : open
              ? 'border-brand ring-2 ring-orange-100'
              : 'border-gray-200 hover:border-gray-300'
        } ${loading ? 'cursor-wait' : ''}`}
      >
        <span className={selected ? 'font-medium text-gray-900' : 'text-gray-400'}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
              <span>Đang tải danh mục...</span>
            </span>
          ) : selected ? selected.name : 'Chọn danh mục'}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {loading ? (
            <CategorySkeleton />
          ) : categories.length === 0 ? (
            <p className="px-4 py-3 text-center text-sm text-gray-400">Không có danh mục</p>
          ) : (
            categories.map((cat) => {
              const active = cat.id === categoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onChange(cat.id, cat.name);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition ${
                    active
                      ? 'bg-orange-50 font-semibold text-brand'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat.iconUrl && (
                    <img src={cat.iconUrl} alt="" className="h-5 w-5 object-contain" />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
