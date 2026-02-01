'use client';

export default function DonationGuestDisclaimer({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 16,
        padding: 16,
        background: '#fff',
      }}
    >
      <label className="d-flex align-items-start gap-2" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ marginTop: 4 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, lineHeight: 1.25 }}>
            I understand this donation is not protected by refund benefits
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            As a guest, you may not be eligible for dispute and refund protection.
          </div>
        </div>
      </label>
    </div>
  );
}
