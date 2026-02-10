'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Eye, Edit, BarChart } from 'lucide-react';
import { CampaignDto } from '@/types/campaign';
import { withFallbackImage } from '@/lib/image';

interface MyCampaignCardProps {
    campaign: CampaignDto;
}

const MyCampaignCard: React.FC<MyCampaignCardProps> = ({ campaign }) => {
    const targetAmount = campaign.activeGoal?.targetAmount || 0;
    const progress = targetAmount > 0 ? Math.min(100, (campaign.balance / targetAmount) * 100) : 0;

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':
            case 'PENDING_REVIEW':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PAUSED':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'CLOSED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
                {/* Campaign Image */}
                <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                    <img
                        src={withFallbackImage(campaign.coverImage, '/assets/img/campaign/1.jpg')}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                    </div>
                </div>

                {/* Campaign Info */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-orange-600 uppercase tracking-wider">
                                {campaign.category || 'Campaign'}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${campaign.type === 'AUTHORIZED'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                {campaign.type === 'AUTHORIZED' ? 'Ủy quyền' : 'Mục tiêu'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                                Created: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                            {campaign.title}
                        </h3>
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
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                        <Link
                            href={`/campaigns-details?id=${campaign.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Eye className="w-4 h-4" />
                            View
                        </Link>
                        <Link
                            href={`/account/campaigns/edit?id=${campaign.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Link>
                        <Link
                            href={`/account/campaigns/expenditures?campaignId=${campaign.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                        >
                            <BarChart className="w-4 h-4" />
                            Expenditures
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyCampaignCard;
