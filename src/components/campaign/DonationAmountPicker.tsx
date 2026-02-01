'use client';

import { useMemo } from 'react';

const presetAmounts = [10, 20, 50, 100];

export default function DonationAmountPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const safeValue = useMemo(() => (Number.isFinite(value) ? value : 0), [value]);

  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 16,
        padding: 16,
        background: '#fff',
      }}
    >
      <div className="widget-title" style={{ marginBottom: 10 }}>
        <h4 style={{ marginBottom: 0 }}>Donation amount</h4>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        {presetAmounts.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              border: '1px solid rgba(0,0,0,0.10)',
              background: safeValue === v ? 'rgba(248, 77, 67, 0.10)' : '#fff',
              borderRadius: 9999,
              padding: '10px 14px',
              fontWeight: 800,
            }}
          >
            ${v}
          </button>
        ))}

        <div
          style={{
            flex: '1 1 auto',
            minWidth: 180,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 9999,
            padding: '8px 12px',
            background: '#fff',
          }}
        >
          <span style={{ opacity: 0.7, fontWeight: 800 }}>$</span>
          <input
            type="number"
            min={1}
            value={safeValue}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              background: 'transparent',
              fontWeight: 700,
            }}
          />
        </div>
      </div>
    </div>
  );
}
