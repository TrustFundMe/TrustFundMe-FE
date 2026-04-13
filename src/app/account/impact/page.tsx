'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Calendar, Heart } from 'lucide-react';
import { paymentService, MyDonationImpactResponse } from '@/services/paymentService';
import Link from 'next/link';

export default function ImpactPage() {
  const [donations, setDonations] = useState<MyDonationImpactResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await paymentService.getMyPaidDonations(100);
        setDonations(data || []);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đồng';
  };

  const calculateStats = () => {
    const totalDonated = donations.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    const uniqueCampaigns = new Set(donations.map(d => d.campaignId).filter(id => id != null)).size;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthDonated = donations.reduce((sum, d) => {
      const dDate = new Date(d.createdAt);
      if (dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear) {
        return sum + (d.totalAmount || 0);
      }
      return sum;
    }, 0);

    return { totalDonated, uniqueCampaigns, thisMonthDonated };
  };

  const stats = calculateStats();

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* Impact Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Tổng số tiền đã ủng hộ</h3>
              <Wallet className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDonated)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Chiến dịch đã ủng hộ</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueCampaigns}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Tháng này</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthDonated)}</p>
          </div>
        </div>

        {/* Impact Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 flex flex-col min-h-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 shrink-0">Lịch sử ủng hộ</h2>

          {loading ? (
            <div className="text-center py-12 flex-1 pt-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12 flex-1 pt-20">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có khoản ủng hộ nào</h3>
              <p className="text-gray-600 mb-6">Hãy bắt đầu ủng hộ các chiến dịch để thấy tác động của bạn tại đây.</p>
              <Link href="/campaigns" className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                <Heart className="w-4 h-4 mr-2" />
                Khám phá chiến dịch
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 relative rounded-md border border-gray-100 custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiến dịch</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ẩn danh</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation.donationId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(donation.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {donation.campaignTitle || 'Chiến dịch không xác định'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-orange-600">
                        {formatCurrency(donation.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {donation.anonymous ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Có
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Không
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
