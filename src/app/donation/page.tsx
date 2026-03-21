'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExpenditureItem, PaymentMethod } from '@/components/donation/types';
import SuccessScreen from '@/components/donation/SuccessScreen';
import TermsModal from '@/components/donation/TermsModal';
import DonationGeneralLayout from '@/components/donation/DonationGeneralLayout';
import DonationItemLayout from '@/components/donation/DonationItemLayout';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import { paymentService, CreatePaymentRequest } from '@/services/paymentService';
import { authService } from '@/services/authService';
import Script from 'next/script';

// Mock data for donors
const mockRecentDonors = [
  { id: 1, name: 'Nguyễn Văn A', amount: 50000, time: '2 phút trước' },
  { id: 2, name: 'Trần Thị B', amount: 20000, time: '5 phút trước' },
  { id: 3, name: 'Ẩn danh', amount: 100000, time: '10 phút trước' },
];

function DonationContent() {
  const searchParams = useSearchParams();
  const prefillAmount = searchParams.get('amount');
  const isGeneralMode = searchParams.get('fundType') === 'general';
  const campaignId = searchParams.get('campaignId');

  // STATES
  const [amount, setAmount] = useState<number>(0);
  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [expenditureItems, setExpenditureItems] = useState<ExpenditureItem[]>([]);
  const [items, setItems] = useState<Record<string, number>>({});
  const [isManualMode, setIsManualMode] = useState(false);
  const [tipPercent, setTipPercent] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payos');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [finalData, setFinalData] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const n = Number(prefillAmount);
    if (!isNaN(n) && n > 0) handlePresetClick(n);
  }, [prefillAmount]);

  useEffect(() => {
    if (campaignId) {
      const id = parseInt(campaignId);
      if (isNaN(id)) return;

      const fetchData = async () => {
        try {
          // Fetch Session
          try {
            const sessionData = await authService.getSession();
            if (sessionData && sessionData.user) {
              setIsGuest(false);
            } else {
              setIsGuest(true);
              setIsAnonymous(true); // Default to anonymous for guests
            }
          } catch (e) {
            setIsGuest(true);
            setIsAnonymous(true);
          }

          // Fetch Campaign Details
          const campaignData = await campaignService.getById(id);
          setCampaign(campaignData);

          // Fetch Expenditure Items
          const itemsData = await expenditureService.getItemsByCampaignId(campaignId);
          const mappedItems: ExpenditureItem[] = itemsData
            .map(item => ({
              id: item.id.toString(),
              name: item.category,
              description: item.note || '',
              price: item.expectedPrice,
              quantityLeft: item.quantityLeft ?? 0
            }))
            .filter(item => item.quantityLeft > 0);
          setExpenditureItems(mappedItems);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [campaignId]);

  // Derived Values
  const tipAmount = Math.round((amount * tipPercent) / 100);
  const totalAmount = amount + tipAmount;

  // Handlers
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

  const handleItemSelect = (itemId: string) => {
    setIsManualMode(true);
    const item = expenditureItems.find(i => i.id === itemId);
    if (!item) return;

    const isCurrentlySelected = !!items[itemId];
    const newItems = { ...items };

    if (isCurrentlySelected) {
      delete newItems[itemId];
    } else {
      newItems[itemId] = 1;
    }

    setItems(newItems);

    const newTotal = Object.entries(newItems).reduce((sum, [id, qty]) => {
      const i = expenditureItems.find(x => x.id === id);
      return sum + (i ? i.price * qty : 0);
    }, 0);
    setAmount(newTotal);
  };

  const handleItemChange = (itemId: string, diff: number) => {
    setIsManualMode(true);
    const item = expenditureItems.find(i => i.id === itemId);
    if (!item) return;

    const currentQty = items[itemId] || 0;
    const newQty = Math.min(item.quantityLeft, Math.max(0, currentQty + diff));

    const newItems = { ...items, [itemId]: newQty };
    if (newQty === 0) delete newItems[itemId];

    setItems(newItems);

    const newTotal = Object.entries(newItems).reduce((sum, [id, qty]) => {
      const i = expenditureItems.find(x => x.id === id);
      return sum + (i ? i.price * qty : 0);
    }, 0);
    setAmount(newTotal);
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'paypal') {
      alert("Phương thức thanh toán này đang được phát triển");
      return;
    }

    if (!campaign) return;

    setSubmitting(true);
    try {
      // 3. Get current user if possible
      let currentDonorId: number | null = null;
      try {
        const sessionData = await authService.getSession();
        if (sessionData && sessionData.user) {
          currentDonorId = sessionData.user.id;
        }
      } catch (e) {
        console.warn("User not logged in, proceeding anonymously");
      }

      // 1. Prepare description: USER{id}CAMPAIGN{id} (Max 25 chars)
      const userIdStr = currentDonorId ? currentDonorId.toString() : "GUEST";
      const description = `USER${userIdStr}CAMPAIGN${campaign.id}`;

      console.log("📝 [Donation] Generated description:", description, "(Length:", description.length, ")");

      // 2. Map items if in manual mode
      const itemsPayload = Object.entries(items).map(([id, qty]) => {
        const item = expenditureItems.find(x => x.id === id);
        return {
          expenditureItemId: parseInt(id),
          quantity: qty,
          amount: item ? item.price : 0
        };
      });

      const request: CreatePaymentRequest = {
        donorId: currentDonorId,
        campaignId: campaign.id,
        donationAmount: amount,
        tipAmount: tipAmount,
        description: description,
        isAnonymous: isAnonymous,
        items: itemsPayload
      };

      // 4. PRE-CHECK: Check Expenditure Item Limits
      if (itemsPayload.length > 0) {
        console.log("🛡️ [Donation] Pre-checking item limits...");
        for (const item of itemsPayload) {
          const checkResult = await paymentService.checkExpenditureItemLimit(item.expenditureItemId, item.quantity);
          if (!checkResult.canDonateMore) {
            console.warn(`🛑 [Donation] Limit exceeded for item ${item.expenditureItemId}:`, checkResult.message);
            alert(checkResult.message || "Số lượng vật phẩm đã đạt giới hạn.");
            setSubmitting(false);
            return;
          }
        }
        console.log("✅ [Donation] All item limits okay");
      }

      // 5. Call Payment API
      const response = await paymentService.createPayment(request);

      if (response.paymentUrl) {
        // Open PayOS checkout in iframe using SDK
        if ((window as any).payOS) {
          const config = {
            onSuccess: (data: any) => {
              console.log("✅ [PayOS] Payment success:", data);
              setFinalData(data);
              setIsSuccess(true);
            },
            onCancel: (data: any) => {
              console.warn("❌ [PayOS] Payment cancelled:", data);
            },
            onExit: (data: any) => {
              console.log("🚪 [PayOS] Checkout closed:", data);
            }
          };
          (window as any).payOS.open(response.paymentUrl, config);
        } else {
          // Fallback if script not loaded
          window.location.href = response.paymentUrl;
        }
      } else {
        // Fallback to internal success page if no URL (shouldn't happen with PayOS)
        window.location.href = `/donation/success?id=${campaignId}&amount=${totalAmount}`;
      }
    } catch (error) {
      console.error('Error creating payment flow:', error);
      alert("Có lỗi xảy ra khi khởi tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleItems = isManualMode
    ? expenditureItems
    : (amount > 0 ? expenditureItems.filter(i => i.price <= amount) : expenditureItems);

  if (isSuccess) {
    return <SuccessScreen totalAmount={finalData?.amount || totalAmount} onReset={() => window.location.reload()} />;
  }

  return (
    <div className="h-screen bg-[#FDFDFD] flex items-center justify-center p-4 font-sans text-gray-900" style={{ fontFamily: 'var(--font-dm-sans)' }}>
      <Script
        src="https://js.payos.vn/v2/payos.js"
        strategy="lazyOnload"
      />
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {isGeneralMode ? (
        <DonationGeneralLayout
          campaign={campaign}
          amount={amount}
          isManualMode={isManualMode}
          tipPercent={tipPercent}
          paymentMethod={paymentMethod}
          isAnonymous={isAnonymous}
          isAgreed={isAgreed}
          submitting={submitting}
          onPresetClick={handlePresetClick}
          onAmountChange={handleAmountInput}
          onTipChange={setTipPercent}
          onPaymentMethodChange={setPaymentMethod}
          onAnonymousChange={setIsAnonymous}
          onAgreedChange={setIsAgreed}
          onShowTerms={() => setShowTerms(true)}
          onSubmit={handleSubmit}
          isGuest={isGuest}
        />
      ) : (
        <DonationItemLayout
          campaign={campaign}
          amount={amount}
          isManualMode={isManualMode}
          items={items}
          visibleItems={visibleItems}
          page={page}
          itemsPerPage={ITEMS_PER_PAGE}
          tipPercent={tipPercent}
          paymentMethod={paymentMethod}
          isAnonymous={isAnonymous}
          isAgreed={isAgreed}
          submitting={submitting}
          onPresetClick={handlePresetClick}
          onAmountChange={handleAmountInput}
          onItemSelect={handleItemSelect}
          onQuantityChange={handleItemChange}
          onPageChange={setPage}
          onTipChange={setTipPercent}
          onPaymentMethodChange={setPaymentMethod}
          onAnonymousChange={setIsAnonymous}
          onAgreedChange={setIsAgreed}
          onShowTerms={() => setShowTerms(true)}
          onSubmit={handleSubmit}
          isGuest={isGuest}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
        
        #payos-checkout-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          display: none;
        }
        #payos-checkout-container:not(:empty) {
          display: block;
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
      <div id="payos-checkout-container"></div>
    </div>
  );
}

export default function DonationPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white flex items-center justify-center font-bold">Đang tải thông tin quyên góp...</div>}>
      <DonationContent />
    </Suspense>
  );
}
