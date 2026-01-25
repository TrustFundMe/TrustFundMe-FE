'use client';

export type RecentDonor = {
  name: string;
  amount: number;
  time: string;
};

export default function DonationRecentDonors({
  donors,
}: {
  donors: RecentDonor[];
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
      <div className="widget-title" style={{ marginBottom: 10 }}>
        <h4 style={{ marginBottom: 0 }}>Recent donations</h4>
      </div>

      <div className="d-flex flex-column" style={{ gap: 10 }}>
        {donors.length === 0 ? (
          <div style={{ fontSize: 14, opacity: 0.7 }}>No donations yet.</div>
        ) : (
          donors.slice(0, 6).map((d, idx) => (
            <div
              key={`${d.name}-${idx}`}
              className="d-flex align-items-center justify-content-between"
              style={{
                paddingBottom: 10,
                borderBottom: idx === Math.min(5, donors.length - 1) ? 'none' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{d.time}</div>
              </div>
              <div style={{ fontWeight: 900 }}>${d.amount.toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
