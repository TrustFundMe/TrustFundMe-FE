'use client';

import DanboxLayout from '@/layout/DanboxLayout';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContextProxy';
import DonationAmountPicker from '@/components/campaign/DonationAmountPicker';
import DonationTipSlider from '@/components/campaign/DonationTipSlider';
import DonationPaymentMethodSelector, {
  type DonationPaymentMethod,
} from '@/components/campaign/DonationPaymentMethodSelector';
import DonationGuestDisclaimer from '@/components/campaign/DonationGuestDisclaimer';
import DonationCampaignSummaryCard from '@/components/campaign/DonationCampaignSummaryCard';
import DonationRecentDonors, { type RecentDonor } from '@/components/campaign/DonationRecentDonors';

type DonationStep = 'form' | 'thanks';

export default function DonationPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const searchParams = useSearchParams();

  const campaignId = searchParams.get('campaignId');
  const prefillAmount = searchParams.get('amount');

  const [step, setStep] = useState<DonationStep>('form');

  const [amount, setAmount] = useState<number>(10);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<DonationPaymentMethod>('wallet');
  const [guestAccepted, setGuestAccepted] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const n = Number(prefillAmount);
    if (prefillAmount && Number.isFinite(n) && n > 0) setAmount(n);
  }, [prefillAmount]);

  const campaign = useMemo(() => {
    const idText = campaignId ? `#${campaignId}` : '';
    return {
      id: campaignId ?? 'unknown',
      title: `Campaign ${idText}`.trim() || 'Campaign',
      raisedAmount: 1250,
      goalAmount: 5000,
    };
  }, [campaignId]);

  const recentDonors = useMemo<RecentDonor[]>(() => {
    return [
      { name: 'Anonymous', amount: 50, time: '2 minutes ago' },
      { name: 'Minh', amount: 20, time: '10 minutes ago' },
      { name: 'Huy', amount: 100, time: '1 hour ago' },
      { name: 'Lan', amount: 10, time: 'Today' },
    ];
  }, []);

  const tipAmount = useMemo(() => Math.round((amount * tipPercent) / 100), [amount, tipPercent]);
  const total = useMemo(() => amount + tipAmount, [amount, tipAmount]);

  const canSubmit = useMemo(() => {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    if (!isAuthenticated && !guestAccepted) return false;
    return true;
  }, [amount, guestAccepted, isAuthenticated]);

  const displayName = useMemo(() => {
    if (!user) return '';
    return user.fullName || user.email;
  }, [user]);

  return (
    <DanboxLayout>
      <section className="causes-details-section fix section-padding" style={{ paddingTop: 0, fontFamily: 'var(--font-dm-sans)' }}>
        <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 900, fontSize: 28, lineHeight: 1.15 }}>Donate</div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>
                Support the campaign with a secure donation.
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
                gap: 24,
                alignItems: 'start',
              }}
            >
              <div style={{ minWidth: 0 }}>
                {step === 'form' ? (
                  <div className="d-flex flex-column" style={{ gap: 16 }}>
                    <DonationAmountPicker value={amount} onChange={setAmount} />

                    <DonationTipSlider value={tipPercent} onChange={setTipPercent} />

                    <DonationPaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

                    {loading ? null : isAuthenticated ? (
                      <div
                        style={{
                          border: '1px solid rgba(0,0,0,0.10)',
                          borderRadius: 16,
                          padding: 16,
                          background: '#fff',
                        }}
                      >
                        <div className="widget-title" style={{ marginBottom: 10 }}>
                          <h4 style={{ marginBottom: 0 }}>Donor info</h4>
                        </div>
                        <div style={{ fontSize: 14, opacity: 0.75 }}>
                          Using your account information.
                        </div>
                        <div style={{ marginTop: 10, fontWeight: 900 }}>{displayName}</div>
                        <div style={{ marginTop: 2, opacity: 0.7, fontSize: 14 }}>{user?.email}</div>
                        {user?.phoneNumber ? (
                          <div style={{ marginTop: 2, opacity: 0.7, fontSize: 14 }}>{user.phoneNumber}</div>
                        ) : null}
                      </div>
                    ) : (
                      <DonationGuestDisclaimer checked={guestAccepted} onChange={setGuestAccepted} />
                    )}

                    <div
                      style={{
                        border: '1px solid rgba(0,0,0,0.10)',
                        borderRadius: 16,
                        padding: 16,
                        background: '#fff',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 900 }}>Total</div>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>${total.toLocaleString()}</div>
                      </div>

                      <div style={{ fontSize: 13, opacity: 0.75 }}>
                        Donation: <b>${amount.toLocaleString()}</b>
                        {' '} Tip ({tipPercent}%): <b>${tipAmount.toLocaleString()}</b>
                      </div>

                      <button
                        type="button"
                        className="theme-btn"
                        disabled={!canSubmit || submitting}
                        onClick={async () => {
                          setSubmitting(true);
                          await new Promise((r) => setTimeout(r, 500));
                          setSubmitting(false);
                          setStep('thanks');
                        }}
                        style={{
                          width: '100%',
                          marginTop: 14,
                          opacity: !canSubmit || submitting ? 0.6 : 1,
                        }}
                      >
                        {submitting ? 'Processing...' : 'Donate now'}
                      </button>

                      {!isAuthenticated ? (
                        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
                          Guests must accept the disclaimer to continue.
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      border: '1px solid rgba(0,0,0,0.10)',
                      borderRadius: 16,
                      padding: 20,
                      background: '#fff',
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 24, lineHeight: 1.2 }}>
                      Thank you for your donation!
                    </div>
                    <div style={{ opacity: 0.75, marginTop: 6 }}>
                      Your support helps this campaign move forward.
                    </div>

                    <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: 12, opacity: 0.65 }}>Campaign</div>
                        <div style={{ fontWeight: 900, marginTop: 4 }}>{campaign.title}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: 12, opacity: 0.65 }}>You donated</div>
                        <div style={{ fontWeight: 900, marginTop: 4 }}>${amount.toLocaleString()}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: 12, opacity: 0.65 }}>Tip</div>
                        <div style={{ fontWeight: 900, marginTop: 4 }}>${tipAmount.toLocaleString()} ({tipPercent}%)</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: 12, opacity: 0.65 }}>Payment</div>
                        <div style={{ fontWeight: 900, marginTop: 4 }}>{paymentMethod}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                      <button type="button" className="theme-btn" onClick={() => setStep('form')}>
                        Donate again
                      </button>
                      <button
                        type="button"
                        className="theme-btn"
                        style={{ background: '#202426' }}
                        onClick={() => {
                          window.location.href = '/campaigns';
                        }}
                      >
                        Back to campaigns
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <DonationCampaignSummaryCard
                  campaignTitle={campaign.title}
                  raisedAmount={campaign.raisedAmount}
                  goalAmount={campaign.goalAmount}
                />

                <DonationRecentDonors donors={recentDonors} />

                <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
                  Payments on this page are UI-only for now. Hooking to BE/payment gateway can be done next.
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 991px) {
            section :global(.container) > div > div > div {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 575px) {
            section :global(.theme-btn) {
              width: 100%;
            }
          }
        `}</style>
      </section>
    </DanboxLayout>
  );
}
