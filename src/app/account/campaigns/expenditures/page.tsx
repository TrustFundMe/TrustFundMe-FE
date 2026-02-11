'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Calendar, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { Expenditure } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';

export default function CampaignExpendituresPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [campaign, setCampaign] = useState<CampaignDto | null>(null);
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Withdrawal Modal States
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
    const [evidenceDate, setEvidenceDate] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        if (!campaignId) {
            setError('Campaign ID is missing.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch campaign details
                const campaignData = await campaignService.getById(Number(campaignId));
                setCampaign(campaignData);

                // Fetch expenditures
                const expendituresData = await expenditureService.getByCampaignId(Number(campaignId));
                setExpenditures(expendituresData);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load campaign data or expenditures.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, isAuthenticated, authLoading, router]);

    const totalSpent = useMemo(() => {
        return expenditures.reduce((sum, exp) => sum + exp.totalAmount, 0);
    }, [expenditures]);

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'APPROVED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Duyệt</span>;
            case 'PENDING':
            case 'PENDING_REVIEW':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Từ chối</span>;
            case 'CLOSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><CheckCircle className="w-3 h-3 mr-1" /> Đã đóng</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const handleRequestWithdrawal = async (id: number) => {
        if (campaign?.type === 'ITEMIZED') {
            setSelectedExpId(id);
            setEvidenceDate('');
            setModalError(null);
            setShowWithdrawalModal(true);
            return;
        }

        if (!confirm('Xác nhận gửi yêu cầu rút tiền cho kế hoạch này?')) return;

        try {
            setLoading(true);
            const updated = await expenditureService.requestWithdrawal(id);
            setExpenditures(prev => prev.map(exp => exp.id === id ? updated : exp));
            alert('Yêu cầu rút tiền đã được gửi thành công.');
        } catch (err: any) {
            console.error('Withdrawal request failed:', err);
            alert(err.response?.data?.message || 'Yêu cầu rút tiền thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const submitWithdrawal = async () => {
        if (!selectedExpId || !evidenceDate) {
            setModalError('Vui lòng chọn hạn nộp minh chứng.');
            return;
        }

        const selectedDate = new Date(evidenceDate);
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        if (selectedDate < now) {
            setModalError('Hạn nộp minh chứng không được ở trong quá khứ.');
            return;
        }

        if (selectedDate > oneMonthLater) {
            setModalError('Hạn nộp minh chứng không được quá 1 tháng kể từ hiện tại.');
            return;
        }

        try {
            setSubmittingWithdrawal(true);
            setModalError(null);

            // Convert to ISO string for backend
            const isoDate = selectedDate.toISOString();
            const updated = await expenditureService.requestWithdrawal(selectedExpId, isoDate);

            setExpenditures(prev => prev.map(exp => exp.id === selectedExpId ? updated : exp));
            setShowWithdrawalModal(false);
            alert('Yêu cầu rút tiền đã được gửi thành công.');
        } catch (err: any) {
            console.error('Withdrawal submission failed:', err);
            setModalError(err.response?.data?.message || 'Yêu cầu rút tiền thất bại.');
        } finally {
            setSubmittingWithdrawal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error || 'Campaign not found'}
                </div>
                <Link href="/account/campaigns" className="mt-4 inline-flex items-center text-orange-600 hover:text-orange-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/account/campaigns" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Campaigns
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                            <p className="mt-1 text-gray-500 flex items-center">
                                Quản lý chi tiêu cho chiến dịch
                                <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded border ${campaign.type === 'AUTHORIZED'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}>
                                    {campaign.type === 'AUTHORIZED' ? 'Ủy quyền' : 'Mục tiêu'}
                                </span>
                            </p>
                        </div>
                        <Link
                            href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Tạo khoản chi mới
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <span className="text-xl font-bold">₫</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Số dư hiện tại</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign.balance)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Tổng số khoản chi</p>
                                <p className="text-2xl font-bold text-gray-900">{expenditures.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                                <span className="text-xl font-bold">Σ</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Tổng tiền đã chi</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpent)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Flow Diagrams - Moved to Top */}
                <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
                    {campaign.type === 'AUTHORIZED' && (
                        <div className="px-6 py-5 bg-blue-50">
                            <p className="text-sm text-blue-800 font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> QUY TRÌNH GIẢI NGÂN (CHIẾN DỊCH ỦY QUYỀN)
                            </p>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                                {[
                                    { step: '1', title: 'Nhận Donate', desc: 'Mọi khoản đóng góp được giữ công khai', active: true },
                                    { step: '2', title: 'Lập danh mục', desc: 'Creator lập kế hoạch chi tiết', active: false },
                                    { step: '3', title: 'Phê duyệt', desc: 'Nhân viên kiểm tra và duyệt chi', active: false },
                                    { step: '4', title: 'Giải ngân', desc: 'Hệ thống chuyển khoản trong 3 ngày', active: false },
                                    { step: '5', title: 'Minh chứng', desc: 'Creator up chứng từ sau khi chi', active: false },
                                ].map((item, idx, arr) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center text-center relative z-10 w-full md:w-auto">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-3 shadow-md transition-all ${idx === 0 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white text-blue-600 border-2 border-blue-200'}`}>
                                            {item.step}
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-[11px] text-gray-600 mt-1.5 px-2 font-medium">{item.desc}</p>

                                        {idx < arr.length - 1 && (
                                            <div className="hidden md:block absolute top-6 left-[65%] w-[70%] h-[2px] bg-blue-200 -z-10"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {campaign.type === 'ITEMIZED' && (
                        <div className="px-6 py-5 bg-purple-50">
                            <p className="text-sm text-purple-800 font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> QUY TRÌNH GIẢI NGÂN (CHIẾN DỊCH MỤC TIÊU)
                            </p>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                                {[
                                    { step: '1', title: 'Nhận Donate', desc: 'Cộng đồng góp tiền cho mục tiêu', active: true },
                                    { step: '2', title: 'Lập danh mục', desc: 'Xác định các khoản cần chi trả', active: false },
                                    { step: '3', title: 'Rút tiền', desc: 'Bấm "Yêu cầu rút" & chốt đợt', active: false },
                                    { step: '4', title: 'Giải ngân', desc: 'Chuyển khoản & up biên lai (3 ngày)', active: false },
                                    { step: '5', title: 'Minh chứng', desc: 'Up minh chứng trước deadline', active: false },
                                ].map((item, idx, arr) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center text-center relative z-10 w-full md:w-auto">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-3 shadow-md transition-all ${idx === 0 ? 'bg-purple-600 text-white ring-4 ring-purple-100' : 'bg-white text-purple-600 border-2 border-purple-200'}`}>
                                            {item.step}
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-[11px] text-gray-600 mt-1.5 px-2 font-medium">{item.desc}</p>

                                        {idx < arr.length - 1 && (
                                            <div className="hidden md:block absolute top-6 left-[65%] w-[70%] h-[2px] bg-purple-200 -z-10"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Expenditure List */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Danh sách các khoản chi</h2>
                    </div>

                    {expenditures.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="mx-auto h-12 w-12 text-gray-300">
                                <FileText className="h-full w-full" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có khoản chi nào</h3>
                            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo một khoản chi mới cho chiến dịch này.</p>
                            <div className="mt-6">
                                <Link
                                    href={`/account/campaigns/expenditures/create?campaignId=${campaign.id}`}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-orange-600 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Tạo khoản chi mới
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mô tả / Kế hoạch
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        {campaign.type === 'AUTHORIZED' && (
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày báo cáo
                                            </th>
                                        )}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rút tiền
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {expenditures.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{exp.plan || 'Chi tiêu không tên'}</div>
                                                <div className="text-sm text-gray-500">
                                                    {/* Could verify item count here if needed */}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(exp.status)}
                                            </td>
                                            {campaign.type === 'AUTHORIZED' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {exp.evidenceDueAt ? new Date(exp.evidenceDueAt).toLocaleDateString() : '-'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {exp.isWithdrawalRequested ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-blue-600 font-medium flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" /> Đã yêu cầu
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 leading-tight italic max-w-[150px]">
                                                            Nhân viên sẽ giải ngân và cập nhật biên lai trong vòng 3 ngày làm việc.
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {campaign.type === 'ITEMIZED' && exp.status === 'APPROVED' ? (
                                                            <button
                                                                onClick={() => handleRequestWithdrawal(exp.id)}
                                                                className="text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
                                                            >
                                                                Yêu cầu rút
                                                            </button>
                                                        ) : campaign.type === 'AUTHORIZED' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] text-blue-600 font-medium leading-tight"> Khi nhân viên duyệt kế hoạch này, hệ thống sẽ tự động gửi yêu cầu rút tiền.</span>
                                                                <span className="text-[10px] text-gray-500 italic">Giải ngân & up biên lai trong 3 ngày làm việc.</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={`/account/campaigns/expenditures/${exp.id}`} className="text-orange-600 hover:text-orange-900">
                                                    Chi tiết
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu rút tiền giải ngân</h3>
                            <p className="text-sm text-gray-600 mb-6 bg-orange-50 p-3 rounded-lg border border-orange-100 italic">
                                <strong>Lưu ý:</strong> Yêu cầu này sẽ đóng đợt quyên góp này để giải ngân cho bạn. Vui lòng xác định hạn hoàn thành minh chứng chi tiêu.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="evidenceDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Hạn nộp minh chứng chi tiêu
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="evidenceDate"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        value={evidenceDate}
                                        onChange={(e) => setEvidenceDate(e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-gray-500 italic">Ràng buộc: Không quá 1 tháng kể từ hôm nay.</p>
                                </div>

                                {modalError && (
                                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {modalError}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setShowWithdrawalModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                    disabled={submittingWithdrawal}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={submitWithdrawal}
                                    className="flex-1 px-4 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 shadow-md shadow-orange-200 transition-all flex items-center justify-center gap-2"
                                    disabled={submittingWithdrawal}
                                >
                                    {submittingWithdrawal ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>Xác nhận yêu cầu</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
