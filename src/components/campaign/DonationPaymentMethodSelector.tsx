'use client';

import { useMemo } from 'react';

export type DonationPaymentMethod = 'wallet' | 'card' | 'bank';

export default function DonationPaymentMethodSelector({
  value,
  onChange,
}: {
  value: DonationPaymentMethod;
  onChange: (next: DonationPaymentMethod) => void;
}) {
  const v = useMemo(() => (value || 'wallet'), [value]);

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
        <h4 style={{ marginBottom: 0 }}>Payment method</h4>
      </div>

      <div className="d-flex flex-column gap-2">
        {(
          [
            { key: 'wallet', label: 'Wallet (recommended)', desc: 'Fast checkout using your TrustFundMe wallet.' },
            { key: 'card', label: 'Credit / Debit card', desc: 'Visa, Mastercard, JCB…' },
            { key: 'bank', label: 'Bank transfer', desc: 'Manual transfer. We will show instructions after submit.' },
          ] as const
        ).map((m) => (
          <label
            key={m.key}
            className="d-flex align-items-start gap-2"
            style={{
              padding: 12,
              borderRadius: 14,
              border: '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer',
              background: v === m.key ? 'rgba(248, 77, 67, 0.08)' : '#fff',
            }}
          >
            <input
              type="radio"
              name="donation_payment_method"
              checked={v === m.key}
              onChange={() => onChange(m.key)}
              style={{ marginTop: 3 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, lineHeight: 1.2 }}>{m.label}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>{m.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
