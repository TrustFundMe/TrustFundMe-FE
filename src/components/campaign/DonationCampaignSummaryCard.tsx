'use client';

export default function DonationCampaignSummaryCard({
  campaignTitle,
  raisedAmount,
  goalAmount,
}: {
  campaignTitle: string;
  raisedAmount: number;
  goalAmount: number;
}) {
  const safeGoal = goalAmount > 0 ? goalAmount : 1;
  const progress = Math.max(0, Math.min(100, Math.round((raisedAmount / safeGoal) * 100)));

  return (
    <div
      className="single-sidebar-widgets"
      style={{
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 16,
        marginBottom: 18,
        background: '#fff',
      }}
    >
      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.2, marginBottom: 6 }}>
          {campaignTitle}
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>Campaign progress</div>

        <div
          style={{
            height: 10,
            borderRadius: 9999,
            background: 'rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 9999,
              background: '#F84D43',
            }}
          />
        </div>

        <div
          className="d-flex align-items-center justify-content-between"
          style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}
        >
          <div>
            <span style={{ fontWeight: 900 }}>${raisedAmount.toLocaleString()}</span> raised
          </div>
          <div>
            Goal: <span style={{ fontWeight: 900 }}>${goalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
