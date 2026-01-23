'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import DanboxLayout from '@/layout/DanboxLayout';
import { Heart, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
  return (
    <ProtectedRoute requireVerified={true}>
      <DanboxLayout header={2} footer={2}>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/account/profile"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Your Fundraisers</h1>
                  <p className="mt-2 text-gray-600">Manage and track your fundraising campaigns</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Plus className="w-5 h-5" />
                  Create Campaign
                </button>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No fundraisers yet</h3>
                <p className="text-gray-600 mb-6">Start your first fundraising campaign to make a difference</p>
                <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Create Your First Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </DanboxLayout>
    </ProtectedRoute>
  );
}
