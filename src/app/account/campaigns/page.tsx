'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import DanboxLayout from '@/layout/DanboxLayout';
import { Heart, Plus, ArrowLeft, Loader2, LayoutGrid, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { campaignService } from '@/services/campaignService';
import { CampaignDto } from '@/types/campaign';
import MyCampaignCard from '@/components/account/MyCampaignCard';

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        console.log('Fetching campaigns for user ID:', user.id);

        // Lấy danh sách chiến dịch của Fund Owner hiện tại
        const data = await campaignService.getByFundOwner(user.id);
        console.log('Campaigns data received:', data);

        // Enrich thêm goal cho mỗi campaign (tạm thời mockup hoặc gọi thêm API nếu cần)
        // Vì API getByFundOwner có thể chưa trả về goal, ta fetch thêm cho từng cái nếu cần
        const enrichedData = await Promise.all(data.map(async (c) => {
          try {
            const goal = await campaignService.getActiveGoalByCampaignId(c.id);
            return { ...c, activeGoal: goal };
          } catch {
            return c;
          }
        }));

        setCampaigns(enrichedData);
      } catch (error) {
        console.error('Failed to fetch user campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user?.id]);

  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DanboxLayout header={2} footer={2}>
        <div className="min-h-screen bg-[#F8FAFC] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <Link
                  href="/account/profile"
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-4 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Profile
                </Link>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  My Campaigns
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Manage your impact and track fundraising progress (Logged in as ID: {user?.id})
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/campaign-creation"
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Start New Campaign
                </Link>
              </div>
            </div>

            {/* Stats & Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="md:col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search your campaigns..."
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">Total</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{campaigns.length}</span>
              </div>
            </div>

            {/* Main Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Fetching your campaigns...</p>
                </div>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {filteredCampaigns.map((campaign) => (
                  <MyCampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-12 text-center animate-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-orange-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? 'No campaigns match your search' : 'Ready to start something amazing?'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                  {searchTerm
                    ? "Try adjusting your search terms to find what you're looking for."
                    : "You haven't created any campaigns yet. Start your first fundraising journey today and make a real impact."}
                </p>
                {!searchTerm && (
                  <Link
                    href="/campaign-creation"
                    className="inline-flex px-8 py-4 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all font-bold shadow-xl shadow-orange-100 hover:scale-105"
                  >
                    Launch My First Campaign
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </DanboxLayout>
    </ProtectedRoute>
  );
}
