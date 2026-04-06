'use client';

import React, { useState, useMemo } from 'react';
import { StatCard } from '@/components/admin/cash-flow/StatCard';
import { CashFlowFilters } from '@/components/admin/cash-flow/CashFlowFilters';
import { CashFlowTable, TransactionDetailModal } from '@/components/admin/cash-flow/CashFlowTable';
import { ExpenditureDetailPanel } from '@/components/admin/cash-flow/ExpenditureDetailPanel';
import { toast } from 'react-hot-toast';

// Mock data - chỉ UI, không gọi API
const mockTransactions: Transaction[] = [
    {
        id: 'TX001',
        time: '14:30 06/04',
        type: 'IN',
        fundType: 'AUTHORIZED',
        source: 'Nguyễn Văn A',
        target: 'Quỹ Chung',
        amount: 1200000,
        content: 'Ủng hộ miền Trung',
        evidence: 'COMPLETED',
        status: 'COMPLETED',
    },
    {
        id: 'TX002',
        time: '15:20 06/04',
        type: 'OUT',
        fundType: 'ITEMIZED',
        source: 'Chiến dịch Cứu trợ miền Trung',
        target: 'Nguyễn Văn A (Staff)',
        amount: 25140036,
        isItem: true,
        itemQuantity: '500 suất',
        content: 'EXP-882',
        expenditureId: 'EXP-882',
        evidence: 'PENDING',
        status: 'PENDING',
    },
    {
        id: 'TX003',
        time: '16:45 06/04',
        type: 'OUT',
        fundType: 'AUTHORIZED',
        source: 'Chiến dịch Cứu hộ động vật',
        target: 'Staff 1',
        amount: 5000000,
        content: 'EXP-885',
        expenditureId: 'EXP-885',
        evidence: 'FLAGGED',
        status: 'FLAGGED',
    },
    {
        id: 'TX004',
        time: '17:10 06/04',
        type: 'IN',
        fundType: 'AUTHORIZED',
        source: 'Trần Thị B',
        target: 'Quỹ Chung',
        amount: 500000,
        content: 'Quyên góp định kỳ',
        evidence: 'COMPLETED',
        status: 'COMPLETED',
    },
    {
        id: 'TX005',
        time: '08:15 07/04',
        type: 'OUT',
        fundType: 'AUTHORIZED',
        source: 'Chiến dịch Xây trường vùng cao',
        target: 'Mặt trận Tổ quốc',
        amount: 150000000,
        content: 'EXP-901',
        expenditureId: 'EXP-901',
        evidence: 'COMPLETED',
        status: 'COMPLETED',
    },
    {
        id: 'TX006',
        time: '09:45 07/04',
        type: 'IN',
        fundType: 'ITEMIZED',
        source: 'Công ty ABC',
        target: 'Kho Vật phẩm',
        amount: 0,
        isItem: true,
        itemQuantity: '2000 thùng mì',
        content: 'Ủng hộ dịch bệnh',
        evidence: 'COMPLETED',
        status: 'COMPLETED',
    },
    {
        id: 'TX007',
        time: '10:30 07/04',
        type: 'OUT',
        fundType: 'AUTHORIZED',
        source: 'Chiến dịch Hỗ trợ bệnh nhi',
        target: 'Bệnh viện K',
        amount: 2856000,
        content: 'EXP-905',
        expenditureId: 'EXP-905',
        evidence: 'PENDING',
        status: 'PENDING',
    },
    {
        id: 'TX008',
        time: '11:00 07/04',
        type: 'IN',
        fundType: 'AUTHORIZED',
        source: 'Lê Văn C',
        target: 'Quỹ Chung',
        amount: 3000000,
        content: 'Quyên góp khẩn cấp',
        evidence: 'COMPLETED',
        status: 'COMPLETED',
    },
    {
        id: 'TX009',
        time: '11:30 07/04',
        type: 'OUT',
        fundType: 'ITEMIZED',
        source: 'Chiến dịch Cây giống Hà Giang',
        target: 'Hợp tác xã Nông nghiệp',
        amount: 45000000,
        isItem: true,
        itemQuantity: '1000 cây giống',
        content: 'EXP-910',
        expenditureId: 'EXP-910',
        evidence: 'COMPLETED',
        status: 'COMPLETED',
    },
    {
        id: 'TX010',
        time: '12:00 07/04',
        type: 'IN',
        fundType: 'AUTHORIZED',
        source: 'Nguyễn Thị D',
        target: 'Quỹ Chung',
        amount: 2000000,
        content: 'Ủng hộ quỹ từ thiện',
        evidence: 'COMPLETED',
        status: 'COMPLETED',
    },
];

// Expenditure detail mock data
const mockExpenditureDetails: Record<string, ExpenditureDetail> = {
    'EXP-882': {
        id: 'EXP-882',
        campaignId: 'CMP-011',
        campaignName: 'Chiến dịch Cứu trợ miền Trung',
        description: 'Mua thực phẩm & nhu yếu phẩm cứu trợ',
        requester: 'Nguyễn Văn A (Staff)',
        requestedAt: '05/04/2026 - 10:30',
        approvedBy: 'Chưa duyệt',
        items: [
            { id: 'EI-001', name: 'Gạo', unit: 'kg', quantity: 200, unitPrice: 25000, total: 5000000 },
            { id: 'EI-002', name: 'Nước mắm', unit: 'chai', quantity: 100, unitPrice: 35000, total: 3500000 },
            { id: 'EI-003', name: 'Dầu ăn', unit: 'chai', quantity: 80, unitPrice: 28000, total: 2240000 },
            { id: 'EI-004', name: 'Bột canh', unit: 'gói', quantity: 300, unitPrice: 8000, total: 2400000 },
            { id: 'EI-005', name: 'Mì gói', unit: 'thùng', quantity: 50, unitPrice: 240000, total: 12000000 },
        ],
        images: [
            'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1583336137344-8b2349d6d0e1?w=400&h=300&fit=crop',
        ],
        totalAmount: 25140000,
        status: 'PENDING',
    },
    'EXP-885': {
        id: 'EXP-885',
        campaignId: 'CMP-018',
        campaignName: 'Chiến dịch Cứu hộ động vật',
        description: 'Thuốc & thức ăn cho thú cứu hộ',
        requester: 'Staff 1',
        requestedAt: '05/04/2026 - 14:00',
        approvedBy: '—',
        items: [
            { id: 'EI-010', name: 'Thuốc kháng sinh', unit: 'viên', quantity: 500, unitPrice: 5000, total: 2500000 },
            { id: 'EI-011', name: 'Thức ăn hạt', unit: 'bao', quantity: 30, unitPrice: 50000, total: 1500000 },
            { id: 'EI-012', name: 'Sữa công thức', unit: 'hộp', quantity: 40, unitPrice: 25000, total: 1000000 },
        ],
        images: [
            'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=300&fit=crop',
        ],
        totalAmount: 5000000,
        status: 'FLAGGED',
    },
    'EXP-901': {
        id: 'EXP-901',
        campaignId: 'CMP-022',
        campaignName: 'Chiến dịch Xây trường vùng cao',
        description: 'Chuyển tiền cho Mặt trận Tổ quốc',
        requester: 'Chiến dịch Xây trường',
        requestedAt: '06/04/2026 - 07:00',
        approvedBy: 'Đã duyệt',
        items: [
            { id: 'EI-020', name: 'Chuyển khoản', unit: 'lần', quantity: 1, unitPrice: 150000000, total: 150000000 },
        ],
        images: [
            'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop',
        ],
        totalAmount: 150000000,
        status: 'PENDING',
    },
    'EXP-905': {
        id: 'EXP-905',
        campaignId: 'CMP-025',
        campaignName: 'Chiến dịch Hỗ trợ bệnh nhi',
        description: 'Thanh toán viện phí',
        requester: 'Staff 2',
        requestedAt: '06/04/2026 - 09:00',
        approvedBy: '—',
        items: [
            { id: 'EI-030', name: 'Viện phí', unit: 'lần', quantity: 1, unitPrice: 2856000, total: 2856000 },
        ],
        images: [],
        totalAmount: 2856000,
        status: 'PENDING',
    },
    'EXP-910': {
        id: 'EXP-910',
        campaignId: 'CMP-028',
        campaignName: 'Chiến dịch Cây giống Hà Giang',
        description: 'Mua cây giống phát cho bà con',
        requester: 'Staff 3',
        requestedAt: '06/04/2026 - 10:00',
        approvedBy: 'Đã duyệt',
        items: [
            { id: 'EI-040', name: 'Cây giống mít', unit: 'cây', quantity: 400, unitPrice: 45000, total: 18000000 },
            { id: 'EI-041', name: 'Cây giống ổi', unit: 'cây', quantity: 300, unitPrice: 35000, total: 10500000 },
            { id: 'EI-042', name: 'Phân bón NPK', unit: 'bao', quantity: 100, unitPrice: 165000, total: 16500000 },
        ],
        images: [
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
        ],
        totalAmount: 45000000,
        status: 'PENDING',
    },
};

// Stats mock
const mockStats = {
    totalFund: 1014104409,
    pending: 110100000,
    disbursed: 42856000,
};

interface Transaction {
    id: string;
    time: string;
    type: 'IN' | 'OUT';
    fundType: 'AUTHORIZED' | 'ITEMIZED';
    source: string;
    target: string;
    amount: number;
    isItem?: boolean;
    itemQuantity?: string;
    content: string;
    expenditureId?: string;
    evidence: 'COMPLETED' | 'PENDING' | 'FLAGGED';
    status: 'COMPLETED' | 'PENDING' | 'FLAGGED';
}

// Mock expenditure details
interface ExpenditureItem {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface ExpenditureDetail {
    id: string;
    campaignId: string;
    campaignName: string;
    description: string;
    requester: string;
    requestedAt: string;
    approvedBy: string;
    items: ExpenditureItem[];
    images: string[];
    totalAmount: number;
    status: 'PENDING' | 'FLAGGED';
}

export default function CashFlowPage() {
    const [filters, setFilters] = useState({
        type: 'ALL',
        fundType: 'ALL',
        status: 'ALL',
        dateRange: 'Khoảng ngày',
    });

    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [selectedExp, setSelectedExp] = useState<ExpenditureDetail | null>(null);

    // Filter logic
    const filteredTransactions = useMemo(() => {
        return mockTransactions.filter(tx => {
            // Type filter
            if (filters.type === 'DONATION' && tx.type !== 'IN') return false;
            if (filters.type === 'WITHDRAWAL' && tx.type !== 'OUT') return false;

            // Fund type filter
            if (filters.fundType !== 'ALL' && tx.fundType !== filters.fundType) return false;

            // Status filter
            if (filters.status === 'COMPLETED' && tx.status !== 'COMPLETED') return false;
            if (filters.status === 'PENDING' && tx.status !== 'PENDING') return false;
            if (filters.status === 'FLAGGED' && tx.status !== 'FLAGGED') return false;

            return true;
        });
    }, [filters]);

    // Filter counts for badge display
    const filterCounts = useMemo(() => ({
        type: {
            ALL: mockTransactions.length,
            DONATION: mockTransactions.filter(tx => tx.type === 'IN').length,
            WITHDRAWAL: mockTransactions.filter(tx => tx.type === 'OUT').length,
        },
        fundType: {
            ALL: mockTransactions.length,
            AUTHORIZED: mockTransactions.filter(tx => tx.fundType === 'AUTHORIZED').length,
            ITEMIZED: mockTransactions.filter(tx => tx.fundType === 'ITEMIZED').length,
        },
        status: {
            ALL: mockTransactions.length,
            COMPLETED: mockTransactions.filter(tx => tx.status === 'COMPLETED').length,
            PENDING: mockTransactions.filter(tx => tx.status === 'PENDING').length,
            FLAGGED: mockTransactions.filter(tx => tx.status === 'FLAGGED').length,
        },
    }), []);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewDetails = (tx: Transaction) => {
        setSelectedTx(tx);
    };

    const handleViewExpenditure = (expId: string) => {
        const detail = mockExpenditureDetails[expId];
        if (detail) {
            setSelectedExp(detail);
        } else {
            toast.error(`Không tìm thấy chi tiết cho ${expId}`);
        }
    };

    const handleApprove = (tx: Transaction) => {
        toast.success(`Đã duyệt giải ngân cho ${tx.id}`);
    };

    const handleFlag = (tx: Transaction) => {
        toast.success(`Đã gửi yêu cầu bổ sung bằng chứng cho ${tx.id}`);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/30 p-3 font-sans">
            {/* Top Section: 3 Balance Cards */}
            <div className="grid grid-cols-3 gap-3 mb-3 shrink-0">
                <StatCard
                    title="TỔNG QUỸ HỆ THỐNG"
                    value={mockStats.totalFund}
                    isCurrency={true}
                    bgColor="bg-[#fff7ed]"
                    titleColor="text-[#c29d84]"
                    valueColor="text-[#7c5d41]"
                />
                <StatCard
                    title="TIỀN TIPS"
                    value={mockStats.pending}
                    isCurrency={true}
                    bgColor="bg-white"
                    titleColor="text-gray-400"
                    valueColor="text-gray-900"
                />
                <StatCard
                    title="TIỀN ĐÃ GIẢI NGÂN"
                    value={mockStats.disbursed}
                    isCurrency={true}
                    bgColor="bg-[#f0fdf4]"
                    titleColor="text-[#86b595]"
                    valueColor="text-[#2d6a4f]"
                />
            </div>

            {/* Middle Section: Filters + Table */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <CashFlowFilters filters={filters} onFilterChange={handleFilterChange} filterCounts={filterCounts} />

                <div className="mt-2">
                    <CashFlowTable
                        transactions={filteredTransactions}
                        onViewDetails={handleViewDetails}
                        onApprove={handleApprove}
                        onFlag={handleFlag}
                        onViewExpenditure={handleViewExpenditure}
                    />
                </div>
            </div>

            {/* Modal chi tiết */}
            <TransactionDetailModal
                transaction={selectedTx}
                onClose={() => setSelectedTx(null)}
                onApprove={handleApprove}
                onFlag={handleFlag}
            />

            {/* EXP Detail Sidebar */}
            <ExpenditureDetailPanel
                expenditure={selectedExp}
                onClose={() => setSelectedExp(null)}
                onApprove={(exp) => {
                    const tx = mockTransactions.find(t => t.expenditureId === exp.id);
                    if (tx) handleApprove(tx);
                    setSelectedExp(null);
                }}
                onFlag={(exp) => {
                    const tx = mockTransactions.find(t => t.expenditureId === exp.id);
                    if (tx) handleFlag(tx);
                    setSelectedExp(null);
                }}
            />
        </div>
    );
}
