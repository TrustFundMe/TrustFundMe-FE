'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExpenditureItem, PaymentMethod } from '@/components/donation/types';
import SuccessScreen from '@/components/donation/SuccessScreen';
import TermsModal from '@/components/donation/TermsModal';
import DonationGeneralLayout from '@/components/donation/DonationGeneralLayout';
import DonationItemLayout from '@/components/donation/DonationItemLayout';

const mockExpenditureItems: ExpenditureItem[] = [
  { id: 'item_1', name: 'Sách giáo khoa', description: 'Trọn bộ lớp 1-5', unit: 'Bộ', price: 250000 },
  { id: 'item_2', name: 'Vở viết', description: '96 trang, giấy trắng', unit: 'Cuốn', price: 10000 },
  { id: 'item_3', name: 'Bút bi', description: 'Hộp 20 cây Thiên Long', unit: 'Hộp', price: 50000 },
  { id: 'item_4', name: 'Thước kẻ', description: 'Nhựa dẻo, 20cm', unit: 'Cái', price: 5000 },
  { id: 'item_5', name: 'Cặp sách', description: 'Chống gù, chống thấm', unit: 'Cái', price: 150000 },
  { id: 'item_6', name: 'Đồng phục', description: 'Vải cotton thoáng mát', unit: 'Bộ', price: 200000 },
];

const mockRecentDonors = [
  { id: 1, name: 'Nguyễn Văn A', amount: 50000, time: '2 phút trước' },
  { id: 2, name: 'Trần Thị B', amount: 20000, time: '5 phút trước' },
  { id: 3, name: 'Ẩn danh', amount: 100000, time: '10 phút trước' },
];

function DonationContent() {
  const searchParams = useSearchParams();
  const prefillAmount = searchParams.get('amount');
  const isGeneralMode = searchParams.get('fundType') === 'general';

  // STATES
  const [amount, setAmount] = useState<number>(0);
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

  useEffect(() => {
    const n = Number(prefillAmount);
    if (!isNaN(n) && n > 0) handlePresetClick(n);
  }, [prefillAmount]);

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
    const item = mockExpenditureItems.find(i => i.id === itemId);
    if (!item) return;

    const newItems = { ...items, [itemId]: 1 };
    setItems(newItems);

    const newTotal = Object.entries(newItems).reduce((sum, [id, qty]) => {
      const i = mockExpenditureItems.find(x => x.id === id);
      return sum + (i ? i.price * qty : 0);
    }, 0);
    setAmount(newTotal);
  };

  const handleItemChange = (itemId: string, diff: number) => {
    setIsManualMode(true);
    const item = mockExpenditureItems.find(i => i.id === itemId);
    if (!item) return;

    const currentQty = items[itemId] || 0;
    const newQty = Math.max(0, currentQty + diff);

    const newItems = { ...items, [itemId]: newQty };
    if (newQty === 0) delete newItems[itemId];

    setItems(newItems);

    const newTotal = Object.entries(newItems).reduce((sum, [id, qty]) => {
      const i = mockExpenditureItems.find(x => x.id === id);
      return sum + (i ? i.price * qty : 0);
    }, 0);
    setAmount(newTotal);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setIsSuccess(true); }, 1500);
  };

  const visibleItems = isManualMode
    ? mockExpenditureItems
    : (amount > 0 ? mockExpenditureItems.filter(i => i.price <= amount) : mockExpenditureItems);

  if (isSuccess) {
    return <SuccessScreen totalAmount={totalAmount} onReset={() => window.location.reload()} />;
  }

  return (
    <div className="h-screen bg-[#FDFDFD] flex items-center justify-center p-4 font-sans text-gray-900" style={{ fontFamily: 'var(--font-dm-sans)' }}>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {isGeneralMode ? (
        <DonationGeneralLayout
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
        />
      ) : (
        <DonationItemLayout
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
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}

export default function DonationPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <DonationContent />
    </Suspense>
  );
}
