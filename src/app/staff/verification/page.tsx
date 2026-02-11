'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RequestTable from '@/components/staff/request/RequestTable';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';
import KYCInputForm from '@/components/staff/request/KYCInputForm';
import BankInputForm from '@/components/staff/request/BankInputForm';
import { kycService } from '@/services/kycService';
import { bankService } from '@/services/bankService';
import { campaignService } from '@/services/campaignService';
import type {
    KycRequest,
    BankRequest,
    UnverifiedOwnerRequest,
    RequestStatus,
    CampaignRequest,
} from '@/components/staff/request/RequestTypes';

function VerificationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userIdParam = searchParams.get('userId');
    const [isLoading, setIsLoading] = useState(false);

    // States
    const [kycRows, setKycRows] = useState<KycRequest[]>([]);
    const [bankRows, setBankRows] = useState<BankRequest[]>([]);
    const [campaignRows, setCampaignRows] = useState<CampaignRequest[]>([]);
    const [selectedVerificationId, setSelectedVerificationId] = useState<string | undefined>();
    const [inputMode, setInputMode] = useState<'NONE' | 'KYC' | 'BANK'>('NONE');
    const [activeSubTab, setActiveSubTab] = useState<'KYC' | 'BANK'>('KYC');
    const [kycSubStatus, setKycSubStatus] = useState<'PENDING' | 'COMPLETED'>('COMPLETED');
    const [bankSubStatus, setBankSubStatus] = useState<'PENDING' | 'COMPLETED'>('COMPLETED');

    const fetchKycRequests = async () => {
        try {
            const kycData = await kycService.getAll();
            const mappedKyc: KycRequest[] = kycData.content.map(k => ({
                id: `KYC_${k.id}`,
                createdAt: k.createdAt,
                status: k.status as RequestStatus,
                type: 'KYC_VERIFICATION',
                userId: k.userId,
                fullName: k.fullName,
                email: k.email,
                phoneNumber: k.phoneNumber,
                idType: k.idType,
                idNumber: k.idNumber,
                issueDate: k.issueDate,
                expiryDate: k.expiryDate,
                issuePlace: k.issuePlace,
                idImageFront: k.idImageFront,
                idImageBack: k.idImageBack,
                selfieImage: k.selfieImage,
            }));
            setKycRows(mappedKyc);
        } catch (error) {
            console.error('Failed to fetch KYC requests', error);
        }
    };

    const fetchBankRequests = async () => {
        try {
            const bankData = await bankService.getAll();
            const mappedBank: BankRequest[] = bankData.map(b => ({
                id: `BANK_${b.id}`,
                createdAt: b.createdAt,
                status: b.status as RequestStatus,
                type: 'BANK_VERIFICATION',
                userId: b.userId,
                bankCode: b.bankCode,
                accountNumber: b.accountNumber,
                accountHolderName: b.accountHolderName,
                isVerified: b.isVerified,
            }));
            setBankRows(mappedBank);
        } catch (error) {
            console.error('Failed to fetch Bank requests', error);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const allCampaigns = await campaignService.getAll();
            const mappedCampaigns: CampaignRequest[] = allCampaigns.map(c => ({
                id: `CAMP_${c.id}`,
                createdAt: c.createdAt || new Date().toISOString(),
                status: (c.status as RequestStatus) || 'PENDING',
                type: 'APPROVE_CAMPAIGN',
                campaignId: c.id,
                campaignTitle: c.title,
                requesterName: `Owner #${c.fundOwnerId}`,
                description: c.description || '',
                category: c.category || '',
                kycVerified: c.kycVerified,
                bankVerified: c.bankVerified,
                fundOwnerId: c.fundOwnerId,
            }));
            setCampaignRows(mappedCampaigns);
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        }
    };

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            await Promise.all([fetchKycRequests(), fetchBankRequests(), fetchCampaigns()]);
            setIsLoading(false);
        };
        initData();
    }, []);

    const unverifiedOwnerRows = useMemo<UnverifiedOwnerRequest[]>(() => {
        const ownersMap = new Map<number, UnverifiedOwnerRequest>();
        campaignRows.forEach(c => {
            if (!c.kycVerified || !c.bankVerified) {
                if (!ownersMap.has(c.fundOwnerId)) {
                    // Check if they have ANY submitted request (not just PENDING) to avoid duplicates
                    const hasSubmittedKyc = kycRows.some(k => k.userId === c.fundOwnerId);
                    const hasSubmittedBank = bankRows.some(b => b.userId === c.fundOwnerId);
                    if ((!c.kycVerified && !hasSubmittedKyc) || (!c.bankVerified && !hasSubmittedBank)) {
                        ownersMap.set(c.fundOwnerId, {
                            id: `USER_${c.fundOwnerId}`,
                            createdAt: c.createdAt,
                            status: 'PENDING',
                            type: 'UNVERIFIED_OWNER',
                            userId: c.fundOwnerId,
                            fullName: c.requesterName,
                            kycVerified: c.kycVerified || false,
                            bankVerified: c.bankVerified || false,
                        });
                    }
                }
            }
        });
        return Array.from(ownersMap.values());
    }, [campaignRows, kycRows, bankRows]);

    const kycPendingRows = useMemo(() => unverifiedOwnerRows.filter(o => !o.kycVerified), [unverifiedOwnerRows]);
    const bankPendingRows = useMemo(() => unverifiedOwnerRows.filter(o => !o.bankVerified), [unverifiedOwnerRows]);

    // Handle URL param selection
    useEffect(() => {
        if (userIdParam) {
            const userId = parseInt(userIdParam);
            // Try to find a submitted request first
            const kyc = kycRows.find(k => k.userId === userId && k.status === 'PENDING');
            if (kyc) {
                setSelectedVerificationId(kyc.id);
                setActiveSubTab('KYC');
                setKycSubStatus('COMPLETED');
                return;
            }
            const bank = bankRows.find(b => b.userId === userId && b.status === 'PENDING');
            if (bank) {
                setSelectedVerificationId(bank.id);
                setActiveSubTab('BANK');
                setBankSubStatus('COMPLETED');
                return;
            }
            const kycMissing = kycPendingRows.find(p => p.userId === userId);
            if (kycMissing) {
                setSelectedVerificationId(kycMissing.id);
                setActiveSubTab('KYC');
                setKycSubStatus('PENDING');
                return;
            }
            const bankMissing = bankPendingRows.find(p => p.userId === userId);
            if (bankMissing) {
                setSelectedVerificationId(bankMissing.id);
                setActiveSubTab('BANK');
                setBankSubStatus('PENDING');
            }
        }
    }, [userIdParam, kycRows, bankRows, kycPendingRows, bankPendingRows]);

    const selectedVerification = useMemo(
        () => [...kycRows, ...bankRows, ...unverifiedOwnerRows].find((r) => r.id === selectedVerificationId) || null,
        [kycRows, bankRows, unverifiedOwnerRows, selectedVerificationId]
    );

    const handleUpdateKycStatus = async (requestId: string, next: RequestStatus, reason?: string) => {
        const kycId = parseInt(requestId.replace('KYC_', ''));
        try {
            await kycService.updateStatus(kycId, next as 'PENDING' | 'APPROVED' | 'REJECTED', reason);
            setKycRows((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: next } : r)));
            fetchCampaigns();
            toast.success(`KYC ${next.toLowerCase()} successfully!`);
        } catch (error: any) {
            console.error('Failed to update KYC status:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            const errorMsg = error.response?.data?.message || 'Failed to update KYC status';
            toast.error(errorMsg);
        }
    };

    const handleUpdateBankStatus = async (requestId: string, next: RequestStatus, reason?: string) => {
        const bankId = parseInt(requestId.replace('BANK_', ''));
        try {
            await bankService.updateStatus(bankId, next as 'PENDING' | 'APPROVED' | 'REJECTED', reason);
            setBankRows((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: next } : r)));
            fetchCampaigns();
            toast.success(`Bank account ${next.toLowerCase()} successfully!`);
        } catch (error: any) {
            console.error('Failed to update bank status:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            const errorMsg = error.response?.data?.message || 'Failed to update bank status';
            toast.error(errorMsg);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f1f5f9]">
            {/* Folder Tabs Headers */}
            <div className="flex items-end px-6 gap-2 h-14">
                <button
                    onClick={() => setActiveSubTab('KYC')}
                    className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${activeSubTab === 'KYC'
                        ? 'bg-white text-red-600 rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
                        : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UserCheck className={`h-4 w-4 ${activeSubTab === 'KYC' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className="whitespace-nowrap">KYC Requests</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSubTab === 'KYC' ? 'bg-red-50 text-red-600' : 'bg-gray-300 text-gray-600'}`}>
                            {kycRows.length + kycPendingRows.length}
                        </span>
                    </div>
                    {activeSubTab === 'KYC' && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
                </button>

                <button
                    onClick={() => setActiveSubTab('BANK')}
                    className={`relative px-6 py-2.5 text-sm font-bold transition-all duration-200 group ${activeSubTab === 'BANK'
                        ? 'bg-white text-red-600 rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
                        : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <CreditCard className={`h-4 w-4 ${activeSubTab === 'BANK' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className="whitespace-nowrap">Bank Requests</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSubTab === 'BANK' ? 'bg-red-50 text-red-600' : 'bg-gray-300 text-gray-600'}`}>
                            {bankRows.length + bankPendingRows.length}
                        </span>
                    </div>
                    {activeSubTab === 'BANK' && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
                </button>
            </div>

            <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 p-6 flex flex-col">
                {/* Sub Status Filter Buttons */}
                <div className="flex items-center gap-2 mb-6">
                    {activeSubTab === 'KYC' ? (
                        <>
                            <button
                                onClick={() => setKycSubStatus('PENDING')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${kycSubStatus === 'PENDING' ? 'bg-red-100 text-red-700 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                Pending (Not Submitted) · {kycPendingRows.length}
                            </button>
                            <button
                                onClick={() => setKycSubStatus('COMPLETED')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${kycSubStatus === 'COMPLETED' ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                Completed (Submitted) · {kycRows.length}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setBankSubStatus('PENDING')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${bankSubStatus === 'PENDING' ? 'bg-red-100 text-red-700 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                Pending (Not Submitted) · {bankPendingRows.length}
                            </button>
                            <button
                                onClick={() => setBankSubStatus('COMPLETED')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${bankSubStatus === 'COMPLETED' ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                Completed (Submitted) · {bankRows.length}
                            </button>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-full overflow-hidden">
                    <div className="lg:col-span-8 overflow-auto flex flex-col gap-8 pr-2">
                        {/* Tab Content */}
                        {activeSubTab === 'KYC' && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" /> {kycSubStatus === 'PENDING' ? 'Manual KYC Required' : 'Submitted KYC Requests'}
                                </h3>
                                <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <RequestTable
                                        rows={(kycSubStatus === 'PENDING' ? kycPendingRows : kycRows) as any[]}
                                        selectedId={selectedVerificationId}
                                        onSelect={(r) => { setSelectedVerificationId(r.id); setInputMode('NONE'); }}
                                        columns={(kycSubStatus === 'PENDING' ? [
                                            {
                                                key: 'user',
                                                title: 'User',
                                                render: (r: UnverifiedOwnerRequest) => (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{r.fullName}</span>
                                                        <span className="text-[10px] text-gray-500">#{r.userId}</span>
                                                    </div>
                                                ),
                                            },
                                            { key: 'status', title: 'Status', render: () => <span className="text-red-500 font-bold text-[10px] uppercase">Missing Info</span> }
                                        ] : [
                                            {
                                                key: 'user',
                                                title: 'User',
                                                render: (r: KycRequest) => (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{r.fullName}</span>
                                                        <span className="text-[10px] text-gray-500">#{r.userId}</span>
                                                    </div>
                                                ),
                                            },
                                            { key: 'email', title: 'Email', render: (r: KycRequest) => <span className="text-gray-600 truncate max-w-[150px] inline-block">{r.email}</span> },
                                            {
                                                key: 'status',
                                                title: 'Status',
                                                render: (r: KycRequest) => (
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${r.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        r.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {r.status}
                                                    </span>
                                                )
                                            }
                                        ]) as any[]}
                                    />
                                    {(kycSubStatus === 'PENDING' ? kycPendingRows : kycRows).length === 0 && (
                                        <div className="p-8 text-center text-gray-400 text-sm">No requests in this category</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'BANK' && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> {bankSubStatus === 'PENDING' ? 'Manual Bank Entry Required' : 'Submitted Bank Requests'}
                                </h3>
                                <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <RequestTable
                                        rows={(bankSubStatus === 'PENDING' ? bankPendingRows : bankRows) as any[]}
                                        selectedId={selectedVerificationId}
                                        onSelect={(r) => { setSelectedVerificationId(r.id); setInputMode('NONE'); }}
                                        columns={(bankSubStatus === 'PENDING' ? [
                                            {
                                                key: 'user',
                                                title: 'User',
                                                render: (r: UnverifiedOwnerRequest) => (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{r.fullName}</span>
                                                        <span className="text-[10px] text-gray-500">#{r.userId}</span>
                                                    </div>
                                                ),
                                            },
                                            { key: 'status', title: 'Status', render: () => <span className="text-red-500 font-bold text-[10px] uppercase">Missing Bank</span> }
                                        ] : [
                                            {
                                                key: 'holder',
                                                title: 'Holder',
                                                render: (r: BankRequest) => (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{r.accountHolderName}</span>
                                                        <span className="text-[10px] text-gray-500">User #{r.userId}</span>
                                                    </div>
                                                ),
                                            },
                                            { key: 'bank', title: 'Bank', render: (r: BankRequest) => <span>{r.bankCode}</span> },
                                            {
                                                key: 'status',
                                                title: 'Status',
                                                render: (r: BankRequest) => (
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${r.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        r.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {r.status}
                                                    </span>
                                                )
                                            }
                                        ]) as any[]}
                                    />
                                    {(bankSubStatus === 'PENDING' ? bankPendingRows : bankRows).length === 0 && (
                                        <div className="p-8 text-center text-gray-400 text-sm">No requests in this category</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 overflow-auto pb-4">
                        {selectedVerification?.type === 'KYC_VERIFICATION' && activeSubTab === 'KYC' && kycSubStatus === 'COMPLETED' ? (
                            <RequestDetailPanel
                                request={selectedVerification as KycRequest}
                                title={`KYC · ${(selectedVerification as KycRequest).fullName}`}
                                fields={[
                                    { label: 'Full Name', value: (selectedVerification as KycRequest).fullName },
                                    { label: 'Email', value: (selectedVerification as KycRequest).email },
                                    { label: 'Phone', value: (selectedVerification as KycRequest).phoneNumber },
                                    { label: 'ID Type', value: (selectedVerification as KycRequest).idType },
                                    { label: 'ID Number', value: (selectedVerification as KycRequest).idNumber },
                                    {
                                        label: 'Documents',
                                        value: (
                                            <div className="space-y-2 mt-2">
                                                <img src={(selectedVerification as KycRequest).selfieImage} alt="Selfie" className="w-full h-32 object-cover rounded-lg border" />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <img src={(selectedVerification as KycRequest).idImageFront} alt="Front" className="h-20 w-full object-cover rounded-lg border" />
                                                    <img src={(selectedVerification as KycRequest).idImageBack} alt="Back" className="h-20 w-full object-cover rounded-lg border" />
                                                </div>
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        ) : selectedVerification?.type === 'BANK_VERIFICATION' && activeSubTab === 'BANK' && bankSubStatus === 'COMPLETED' ? (
                            <RequestDetailPanel
                                request={selectedVerification as BankRequest}
                                title={`Bank · ${(selectedVerification as BankRequest).accountHolderName}`}
                                fields={[
                                    { label: 'Bank Name', value: (selectedVerification as BankRequest).bankCode },
                                    { label: 'Account Holder', value: (selectedVerification as BankRequest).accountHolderName },
                                    { label: 'Account Number', value: (selectedVerification as BankRequest).accountNumber },
                                ]}
                            />
                        ) : selectedVerification?.type === 'UNVERIFIED_OWNER' && ((activeSubTab === 'KYC' && kycSubStatus === 'PENDING') || (activeSubTab === 'BANK' && bankSubStatus === 'PENDING')) ? (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
                                <div className="flex justify-between items-start border-b pb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Manual Entry</h4>
                                        <p className="text-xs text-gray-500">User #{(selectedVerification as UnverifiedOwnerRequest).userId}</p>
                                    </div>
                                    <ShieldCheck className="h-6 w-6 text-orange-500" />
                                </div>

                                <div className="space-y-4">
                                    {activeSubTab === 'KYC' && kycSubStatus === 'PENDING' && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-700">KYC Information</span>
                                                <span className="text-red-500 font-bold">Missing</span>
                                            </div>
                                            <button
                                                onClick={() => setInputMode(inputMode === 'KYC' ? 'NONE' : 'KYC')}
                                                className="w-full py-2 text-xs font-bold border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:text-orange-600 transition"
                                            >
                                                {inputMode === 'KYC' ? 'Close Form' : '+ Add KYC Data'}
                                            </button>
                                            {inputMode === 'KYC' && (
                                                <div className="bg-gray-50 p-2 rounded-xl mt-2">
                                                    <KYCInputForm
                                                        userId={(selectedVerification as UnverifiedOwnerRequest).userId}
                                                        onSuccess={() => { setInputMode('NONE'); fetchKycRequests(); }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeSubTab === 'BANK' && bankSubStatus === 'PENDING' && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-700">Bank Account</span>
                                                <span className="text-red-500 font-bold">Missing</span>
                                            </div>
                                            <button
                                                onClick={() => setInputMode(inputMode === 'BANK' ? 'NONE' : 'BANK')}
                                                className="w-full py-2 text-xs font-bold border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:text-blue-600 transition"
                                            >
                                                {inputMode === 'BANK' ? 'Close Form' : '+ Add Bank Data'}
                                            </button>
                                            {inputMode === 'BANK' && (
                                                <div className="bg-gray-50 p-2 rounded-xl mt-2">
                                                    <BankInputForm
                                                        userId={(selectedVerification as UnverifiedOwnerRequest).userId}
                                                        onSuccess={() => { setInputMode('NONE'); fetchBankRequests(); }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                Select a verification request to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UserVerificationPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading verification module...</div>}>
            <VerificationContent />
        </Suspense>
    );
}
