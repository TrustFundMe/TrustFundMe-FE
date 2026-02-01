'use client';

import { useMemo } from 'react';

const presets = [0, 5, 10, 15];

export default function DonationTipSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const v = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(30, Math.round(n)));
  }, [value]);

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
        <h4 style={{ marginBottom: 0 }}>Tip for TrustFundMe</h4>
      </div>

      <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 12 }}>
        Add a small tip to help keep the platform running. You can change this anytime.
      </div>

      <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 800 }}>{v}%</div>
        <div className="d-flex align-items-center gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              style={{
                border: '1px solid rgba(0,0,0,0.10)',
                background: v === p ? 'rgba(248, 77, 67, 0.10)' : '#fff',
                borderRadius: 9999,
                padding: '6px 10px',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={30}
        value={v}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ width: '100%' }}
      />

      <div className="d-flex align-items-center justify-content-between" style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
        <div>0%</div>
        <div>30%</div>
      </div>
    </div>
  );
}
