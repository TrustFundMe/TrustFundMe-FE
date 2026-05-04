'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpenditureItem, PaymentMethod } from '@/components/donation/types';
import { generateSuggestions, SuggestionOption } from '@/utils/dpSuggestion';
import TermsModal from '@/components/donation/TermsModal';
import SuggestionModal from '@/components/donation/SuggestionModal';
import DonationGeneralLayout from '@/components/donation/DonationGeneralLayout';
import DonationItemLayout from '@/components/donation/DonationItemLayout';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import VietQRModal from '@/components/donation/VietQRModal';
import { paymentService, CreatePaymentRequest } from '@/services/paymentService';
import { authService } from '@/services/authService';
import { aiService } from '@/services/aiService';
import { useToast } from '@/components/ui/Toast';
import { Loader2, X } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  fundType: 'general' | 'item';
  initialAmount?: number;
}

export default function DonationModal({
  isOpen,
  onClose,
  campaignId,
  fundType,
  initialAmount = 0,
}: DonationModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isGeneralMode = fundType === 'general';

  // STATES (mirrored from donation page)
  const [amount, setAmount] = useState<number>(0);
  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [expenditureItems, setExpenditureItems] = useState<ExpenditureItem[]>([]);
  const [items, setItems] = useState<Record<string, number>>({});
  const [uiQuantities, setUiQuantities] = useState<Record<string, number>>({});
  const [isManualMode, setIsManualMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payos');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionOption[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [donationBlocked, setDonationBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [currentDonationId, setCurrentDonationId] = useState<number | null>(null);
  const [currentOrderCode, setCurrentOrderCode] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Set initial amount
  useEffect(() => {
    if (isOpen && initialAmount > 0) {
      handlePresetClick(initialAmount);
    }
  }, [isOpen, initialAmount]);

  // Fetch campaign data when modal opens
  useEffect(() => {
    if (!isOpen || !campaignId) return;

    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch Session
        try {
          const sessionData = await authService.getSession();
          if (sessionData && sessionData.user) {
            if (mounted) setIsGuest(false);
          } else {
            if (mounted) {
              setIsGuest(true);
              setIsAnonymous(true);
            }
          }
        } catch {
          if (mounted) {
            setIsGuest(true);
            setIsAnonymous(true);
          }
        }

        // Fetch Campaign Details
        const campaignData = await campaignService.getById(campaignId);
        if (mounted) setCampaign(campaignData);

        // Fetch Expenditure Items
        try {
          const itemsData = await expenditureService.getApprovedItemsByCampaign(String(campaignId));
          const mappedItems: ExpenditureItem[] = (itemsData as any[])
            .map((item: any) => ({
              id: item.id.toString(),
              name: item.name,
              description: item.note || '',
              price: item.expectedPrice,
              quantityLeft: item.quantityLeft ?? 0,
            }))
            .filter(item => item.quantityLeft > 0);

          if (mounted) {
            setExpenditureItems(mappedItems);
            setDonationBlocked(false);
            const initialQtys: Record<string, number> = {};
            mappedItems.forEach(i => (initialQtys[i.id] = 1));
            setUiQuantities(initialQtys);
          }
        } catch (itemsErr: any) {
          if (itemsErr.response?.status === 403 && mounted) {
            setExpenditureItems([]);
            setDonationBlocked(true);
            setBlockedMessage(
              itemsErr.response?.data?.message ||
                'Chiến dịch đang trong quá trình giải ngân, chưa thể nhận quyên góp.',
            );
          }
        }

        if (mounted) setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching donation data:', error);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [isOpen, campaignId]);

  // Polling for payment status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (showQR && currentDonationId) {
      pollInterval = setInterval(async () => {
        try {
          const donation = await paymentService.getDonation(currentDonationId);
          if (donation.status === 'PAID') {
            clearInterval(pollInterval);
            setRedirecting(true);
            setShowQR(false);
            router.push(`/thankyou-new?donationId=${currentDonationId}`);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [showQR, currentDonationId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount(0);
      setItems({});
      setIsManualMode(false);
      setIsAgreed(false);
      setShowQR(false);
      setQrUrl('');
      setCurrentDonationId(null);
      setCurrentOrderCode(null);
      setRedirecting(false);
      setDataLoaded(false);
      setSuggestions([]);
      setShowSuggestionsModal(false);
      setShowTerms(false);
    }
  }, [isOpen]);

  // Handlers (identical to donation page)
  const handlePresetClick = (val: number) => {
    setIsManualMode(false);
    setAmount(val);
    setItems({});
    setPage(1);
  };

  const handleAmountInput = (val: number) => {
    setIsManualMode(false);
    setAmount(val);
    setItems({});
    setPage(1);
  };

  const handleShowSuggestions = () => {
    if (expenditureItems.length === 0) {
      toast('Dữ liệu vật phẩm chưa tải xong. Vui lòng đợi.', 'info');
      return;
    }
    if (amount <= 0) return;
    const suggs = generateSuggestions(amount, expenditureItems);
    setSuggestions(suggs);
    setShowSuggestionsModal(suggs.length > 0);

    if (suggs.length > 0) {
      setLoadingLabels(true);
      aiService
        .generateSuggestionLabels({ amount, options: suggs })
        .then(labels => {
          setSuggestions(prev =>
            prev.map((opt, i) => ({ ...opt, label: labels[i] || opt.label })),
          );
        })
        .catch(() => {})
        .finally(() => setLoadingLabels(false));
    }
  };

  const handleItemSelect = async (itemId: string, qty: number) => {
    setIsManualMode(true);
    const item = expenditureItems.find(i => i.id === itemId);
    if (!item) return;
    const newItems = { ...items, [itemId]: qty };
    setItems(newItems);
    const newTotal = Object.entries(newItems).reduce((sum, [id, q]) => {
      const i = expenditureItems.find(x => x.id === id);
      return sum + (i ? i.price * q : 0);
    }, 0);
    setAmount(newTotal);
  };

  const handleItemDeselect = async (itemId: string) => {
    const newItems = { ...items };
    delete newItems[itemId];
    setItems(newItems);
    const newTotal = Object.entries(newItems).reduce((sum, [id, qty]) => {
      const i = expenditureItems.find(x => x.id === id);
      return sum + (i ? i.price * qty : 0);
    }, 0);
    setAmount(newTotal);
  };

  const handleApplySuggestion = (option: SuggestionOption) => {
    setIsManualMode(true);
    const newItems: Record<string, number> = {};
    option.items.forEach(item => {
      newItems[item.id] = item.quantity;
    });
    setItems(newItems);
    setAmount(option.total);
    setSuggestions([]);
  };

  const handleItemChange = async (itemId: string, diff: number) => {
    setIsManualMode(true);
    const item = expenditureItems.find(i => i.id === itemId);
    if (!item) return;
    const currentQty = uiQuantities[itemId] || 1;
    const newQty = Math.min(item.quantityLeft, Math.max(1, currentQty + diff));
    setUiQuantities(prev => ({ ...prev, [itemId]: newQty }));
    if (items[itemId]) {
      const newItems = { ...items, [itemId]: newQty };
      setItems(newItems);
      const newTotal = Object.entries(newItems).reduce((sum, [id, qty]) => {
        const i = expenditureItems.find(x => x.id === id);
        return sum + (i ? i.price * qty : 0);
      }, 0);
      setAmount(newTotal);
    }
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'paypal') {
      toast('Phương thức thanh toán này đang được phát triển', 'info');
      return;
    }
    if (!campaign) return;

    setSubmitting(true);
    try {
      let currentDonorId: number | null = null;
      try {
        const sessionData = await authService.getSession();
        if (sessionData && sessionData.user) {
          currentDonorId = sessionData.user.id;
        }
      } catch {
        console.warn('User not logged in, proceeding anonymously');
      }

      const userIdStr = currentDonorId ? currentDonorId.toString() : 'GUEST';
      const description = `USER${userIdStr}CAMPAIGN${campaign.id}`;

      const itemsPayload = Object.entries(items).map(([id, qty]) => {
        const item = expenditureItems.find(x => x.id === id);
        return {
          expenditureItemId: parseInt(id),
          quantity: qty,
          amount: item ? item.price : 0,
        };
      });

      const request: CreatePaymentRequest = {
        donorId: currentDonorId,
        campaignId: campaign.id,
        donationAmount: amount,
        tipAmount: 0,
        description,
        isAnonymous,
        items: itemsPayload,
      };

      // Pre-check expenditure item limits
      if (itemsPayload.length > 0) {
        for (const item of itemsPayload) {
          try {
            const checkResult = await paymentService.checkExpenditureItemLimit(
              item.expenditureItemId,
              item.quantity,
            );
            if (!checkResult.canDonateMore) {
              toast(checkResult.message || 'Số lượng vật phẩm đã đạt giới hạn.', 'error');
              setSubmitting(false);
              return;
            }
            if (checkResult.checkSuccessful && checkResult.quantityLeft !== undefined) {
              setExpenditureItems(prev =>
                prev.map(i =>
                  i.id === item.expenditureItemId.toString()
                    ? { ...i, quantityLeft: checkResult.quantityLeft }
                    : i,
                ),
              );
            }
          } catch (err: any) {
            console.warn('Could not verify item limit, proceeding anyway:', err?.message);
          }
        }
      }

      const response = await paymentService.createPayment(request);

      if (response.paymentUrl) {
        setQrUrl(response.paymentUrl);
        if (response.donationId) {
          setCurrentDonationId(response.donationId);
        }
        if (response.paymentLinkId) {
          setCurrentOrderCode(response.paymentLinkId);
        }
        setShowQR(true);
      } else {
        window.location.href = `/donation/success?id=${campaignId}&amount=${amount}`;
      }
    } catch (error) {
      console.error('Error creating payment flow:', error);
      toast('Có lỗi xảy ra khi khởi tạo thanh toán. Vui lòng thử lại sau.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleItems = isManualMode
    ? expenditureItems
    : amount > 0
      ? expenditureItems.filter(i => i.price <= amount)
      : expenditureItems;

  if (!isOpen) return null;

  return (
    <>
      {/* Modal overlay */}
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center"
        style={{ fontFamily: 'var(--font-dm-sans)' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
          onClick={onClose}
        />

        {/* Modal content */}
        <div
          className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[1140px] md:mx-4 bg-white md:rounded-3xl overflow-hidden flex items-center justify-center animate-[slideUp_300ms_ease-out]"
        >
          {/* Close button (always visible) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Inner scrollable area */}
          <div className="w-full h-full overflow-y-auto flex items-center justify-center p-4 md:p-6">
            {/* VietQR Modal (nested) */}
            <VietQRModal
              isOpen={showQR}
              onClose={() => setShowQR(false)}
              qrUrl={qrUrl}
              donationId={currentDonationId}
              orderCode={currentOrderCode}
              amount={amount}
              onConfirm={async () => {
                if (currentDonationId) {
                  try {
                    await paymentService.verifyPayment(currentDonationId);
                    paymentService.syncQuantity(currentDonationId).catch(() => {});
                  } catch {}
                }
                setRedirecting(true);
                setShowQR(false);
                router.push(`/thankyou-new?donationId=${currentDonationId}`);
              }}
              onTimeout={async () => {
                if (currentDonationId) {
                  try {
                    await paymentService.cancelDonation(currentDonationId);
                  } catch {}
                }
                setShowQR(false);
                onClose();
                toast('Hết thời gian thanh toán. Giao dịch đã bị huỷ.', 'error');
              }}
            />

            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

            {showSuggestionsModal && suggestions.length > 0 && (
              <SuggestionModal
                suggestions={suggestions}
                onApply={handleApplySuggestion}
                onClose={() => setShowSuggestionsModal(false)}
                targetAmount={amount}
                loading={loadingLabels}
              />
            )}

            {redirecting && (
              <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-900">Đang chuẩn bị trang cảm ơn...</p>
                <p className="text-sm text-gray-500">Cảm ơn tấm lòng hảo tâm của bạn!</p>
              </div>
            )}

            {isGeneralMode ? (
              <DonationGeneralLayout
                campaign={campaign}
                amount={amount}
                isManualMode={isManualMode}
                paymentMethod={paymentMethod}
                isAnonymous={isAnonymous}
                isAgreed={isAgreed}
                submitting={submitting}
                onPresetClick={handlePresetClick}
                onAmountChange={handleAmountInput}
                onPaymentMethodChange={setPaymentMethod}
                onAnonymousChange={setIsAnonymous}
                onAgreedChange={setIsAgreed}
                onShowTerms={() => setShowTerms(true)}
                onSubmit={handleSubmit}
                isGuest={isGuest}
                onBack={onClose}
              />
            ) : (
              <DonationItemLayout
                campaign={campaign}
                amount={amount}
                donationBlocked={donationBlocked}
                blockedMessage={blockedMessage}
                isManualMode={isManualMode}
                items={items}
                uiQuantities={uiQuantities}
                visibleItems={visibleItems}
                page={page}
                itemsPerPage={ITEMS_PER_PAGE}
                paymentMethod={paymentMethod}
                isAnonymous={isAnonymous}
                isAgreed={isAgreed}
                submitting={submitting}
                onPresetClick={handlePresetClick}
                onAmountChange={handleAmountInput}
                onShowSuggestions={handleShowSuggestions}
                onItemSelect={handleItemSelect}
                onQuantityChange={handleItemChange}
                onItemDeselect={handleItemDeselect}
                onPageChange={setPage}
                onPaymentMethodChange={setPaymentMethod}
                onAnonymousChange={setIsAnonymous}
                onAgreedChange={setIsAgreed}
                onShowTerms={() => setShowTerms(true)}
                onSubmit={handleSubmit}
                isGuest={isGuest}
                onBack={onClose}
              />
            )}
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
