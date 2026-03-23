'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Eye, Edit, BarChart, MessageSquare, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CampaignDto } from '@/types/campaign';
import { useToast } from '@/components/ui/Toast';
import UserChatModal from '@/components/chat/UserChatModal';
import { withFallbackImage } from '@/lib/image';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal';
import Image from 'next/image';

interface MyCampaignCardProps {
    campaign: CampaignDto;
    assignedReviewerName?: string;
    onChatClick: (campaign: CampaignDto) => void;
}

const MyCampaignCard: React.FC<MyCampaignCardProps> = ({ campaign, assignedReviewerName, onChatClick }) => {
    const targetAmount = campaign.activeGoal?.targetAmount || 0;
    const progress = targetAmount > 0 ? Math.min(100, (campaign.balance / targetAmount) * 100) : 0;

    const { toast } = useToast();
    const router = useRouter();
    const handleChatClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onChatClick(campaign);
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
                return 'Đang hoạt động';
            case 'ACTIVE':
                return 'Đang hoạt động';
            case 'PENDING':
            case 'PENDING_APPROVAL':
                return 'Chờ duyệt';
            case 'PENDING_REVIEW':
                return 'Đang xem xét';
            case 'PAUSED':
                return 'Tạm dừng';
            case 'CLOSED':
                return 'Đã đóng';
            case 'REJECTED':
                return 'Bị từ chối';
            case 'DISABLED':
                return 'Vô hiệu hóa';
            default:
                return status || 'N/A';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':
            case 'PENDING_APPROVAL':
            case 'PENDING_REVIEW':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PAUSED':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'CLOSED':
            case 'REJECTED':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'DISABLED':
                return 'bg-red-50 text-red-600 border-red-100';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const isPending = ['PENDING', 'PENDING_APPROVAL', 'PENDING_REVIEW'].includes(campaign.status?.toUpperCase());
    const isRejected = campaign.status?.toUpperCase() === 'REJECTED';
    const isDisabled = campaign.status?.toUpperCase() === 'DISABLED';
    const isApproved = campaign.status?.toUpperCase() === 'APPROVED';
    const [showRejectionReason, setShowRejectionReason] = useState(false);

    return (
        <div id={`campaign-${campaign.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
                {/* Campaign Image */}
                <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                    <Image
                        src={withFallbackImage((campaign.coverImageUrl || campaign.coverImage) as string, '/assets/img/campaign/1.png')}
                        alt={campaign.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 256px"
                        className={`object-cover ${isDisabled ? 'grayscale' : ''}`}
                    />
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold border z-10 ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                    </div>
                </div>

                {/* Campaign Info */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-orange-600 uppercase tracking-wider">
                                {campaign.categoryName || campaign.category || 'Campaign'}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${campaign.type === 'AUTHORIZED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                {campaign.type === 'AUTHORIZED' ? 'Quỹ ủy quyền' : campaign.type === 'ITEMIZED' ? 'Quỹ vật phẩm' : 'Chiến dịch'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                                Tạo ngày: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        {isPending && assignedReviewerName && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 mb-2">
                                <span className="font-semibold">NV phụ trách:</span>
                                <span>{assignedReviewerName}</span>
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                            {campaign.title}
                        </h3>

                        {isDisabled ? (
                            <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 mb-4 animate-pulse">
                                <div className="flex items-center gap-2 text-rose-600 font-bold mb-1 uppercase text-xs">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Chiến dịch bị vô hiệu hóa</span>
                                </div>
                                <p className="text-rose-800/60 text-xs font-medium">
                                    {campaign.rejectionReason
                                        ? `Lý do: ${campaign.rejectionReason}`
                                        : "Chiến dịch này đã bị tạm dừng bởi quản trị viên. Mọi hoạt động quyên góp và chi tiêu hiện bị khóa."}
                                </p>
                            </div>
                        ) : !isRejected ? (
                            <>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {campaign.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-gray-900">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign.balance)}
                                        </span>
                                        <span className="text-gray-600">
                                            {progress.toFixed(0)}% of {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(targetAmount)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 text-red-700 font-semibold mb-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Chiến dịch bị từ chối</span>
                                </div>
                                <p className="text-red-600 text-sm">
                                    Chiến dịch của bạn không thể hoạt động. Vui lòng xem lý do và chỉnh sửa lại.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                        {isRejected ? (
                            <>
                                <button
                                    onClick={() => setShowRejectionReason(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold shadow-sm"
                                >
                                    <Eye className="w-4 h-4" />
                                    Xem lý do bị từ chối
                                </button>
                                <Link
                                    href={`/account/campaigns/edit?id=${campaign.id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    <Edit className="w-4 h-4" />
                                    Sửa & Gửi lại
                                </Link>
                            </>
                        ) : (
                            <>
                                {!isPending && (
                                    <>
                                        <Link
                                            href={`/campaigns-details?id=${campaign.id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem
                                        </Link>
                                        <Link
                                            href={`/account/campaigns/expenditures?campaignId=${campaign.id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                                        >
                                            <BarChart className="w-4 h-4" />
                                            Chi tiêu
                                        </Link>
                                    </>
                                )}
                                {!isDisabled && !isApproved && (
                                    <Link
                                        href={`/account/campaigns/edit?id=${campaign.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Sửa
                                    </Link>
                                )}
                                <button
                                    onClick={(e) => {
                                        if (isDisabled) {
                                            toast('Chiến dịch đã bị vô hiệu hóa, không thể nhắn tin.', 'error');
                                            return;
                                        }
                                        if (isPending) {
                                            toast('Chiến dịch đang trong quá trình xét duyệt, chưa có nhân viên tiếp nhận. Vui lòng nhắn tin sau.', 'info');
                                            return;
                                        }
                                        handleChatClick(e);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium border ${isDisabled || isPending
                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Nhắn tin
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Modal open={showRejectionReason} onOpenChange={setShowRejectionReason}>
                <ModalContent className="max-w-md">
                    <ModalHeader>
                        <ModalTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6" />
                            Lý do bị từ chối
                        </ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <p className="text-gray-700 leading-relaxed italic">
                                "{campaign.rejectionReason || 'Không có lý do cụ thể được cung cấp.'}"
                            </p>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Vui lòng chỉnh sửa chiến dịch của bạn dựa trên lý do trên và gửi lại để được xem xét.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <button
                            onClick={() => setShowRejectionReason(false)}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                        >
                            Đóng
                        </button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default MyCampaignCard;
