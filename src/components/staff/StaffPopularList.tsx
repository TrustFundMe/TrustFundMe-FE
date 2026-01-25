'use client';

type Item = {
  name: string;
  subtitle: string;
  value: string;
  pct: number;
  colorClassName: string;
};

export default function StaffPopularList({ items }: { items: Item[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.name} className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-gray-900">{it.name}</div>
              <div className="mt-0.5 truncate text-[11px] text-gray-500">{it.subtitle}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-semibold text-gray-900">{it.value}</div>
              <div className="mt-0.5 text-[11px] text-gray-500">{it.pct}%</div>
            </div>
          </div>

          <div className="mt-2 h-2 rounded-full bg-white ring-1 ring-black/5">
            <div
              className={`h-2 rounded-full ${it.colorClassName}`}
              style={{ width: `${Math.max(6, Math.min(100, it.pct))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
